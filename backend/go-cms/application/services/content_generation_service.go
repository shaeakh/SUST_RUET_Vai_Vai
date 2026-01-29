package services

import (
	"context"
	"fmt"
	"strings"
	"time"

	"github.com/google/generative-ai-go/genai"
	"github.com/google/uuid"
	"google.golang.org/api/option"
	"github.com/shaeakh/sust-cms/domain/entities"
	"github.com/shaeakh/sust-cms/domain/repositories"
	"github.com/shaeakh/sust-cms/infrastructure/gemini"
)

// ContentGenerationService handles AI-powered content generation
type ContentGenerationService struct {
	embeddingRepo    repositories.ContentEmbeddingRepository
	contentRepo      repositories.ContentRepository
	geminiEmbedder   *gemini.Embedder
}

// NewContentGenerationService creates a new content generation service
func NewContentGenerationService(
	embeddingRepo repositories.ContentEmbeddingRepository,
	contentRepo repositories.ContentRepository,
	geminiEmbedder *gemini.Embedder,
) *ContentGenerationService {
	return &ContentGenerationService{
		embeddingRepo:  embeddingRepo,
		contentRepo:    contentRepo,
		geminiEmbedder: geminiEmbedder,
	}
}

// GeneratedStudyMaterial represents generated study material
type GeneratedStudyMaterial struct {
	ID          string    `json:"id"`
	Query       string    `json:"query"`
	Title       string    `json:"title"`
	Content     string    `json:"content"`
	Format      string    `json:"format"` // markdown, html, pdf
	SourceCount int       `json:"source_count"`
	GeneratedAt time.Time `json:"generated_at"`
}

// GenerateStudyMaterial generates comprehensive study material based on query and class content
func (cgs *ContentGenerationService) GenerateStudyMaterial(
	ctx context.Context,
	classroomID string,
	query string,
	includeCodeExamples bool,
	includeDiagrams bool,
) (*GeneratedStudyMaterial, error) {

	// Step 1: Retrieve relevant class content chunks
	queryEmbedding, err := cgs.geminiEmbedder.Embed(ctx, query)
	if err != nil {
		return nil, fmt.Errorf("failed to generate query embedding: %w", err)
	}

	embeddingResults, err := cgs.embeddingRepo.SemanticSearch(ctx, queryEmbedding, classroomID, 15)
	if err != nil {
		return nil, fmt.Errorf("failed to search class materials: %w", err)
	}

	// Step 2: Build context from class materials
	var classContext strings.Builder
	classContext.WriteString("# Class Materials Context\n\n")
	
	contentCache := make(map[string]*entities.Content)

	for i, emb := range embeddingResults {
		// Get content details to extract topic and other metadata
		var content *entities.Content
		if cached, ok := contentCache[emb.ContentID]; ok {
			content = cached
		} else {
			var err error
			content, err = cgs.contentRepo.FindByID(ctx, emb.ContentID)
			if err != nil {
				continue
			}
			contentCache[emb.ContentID] = content
		}

		topic := "General"
		if content != nil {
			topic = content.Topic
		}

		classContext.WriteString(fmt.Sprintf("## Material %d (Topic: %s, Index: %d)\n%s\n\n",
			i+1, topic, emb.ChunkIndex, emb.ChunkText))
	}

	// Step 3: Generate comprehensive study material using Gemini
	generatedContent, title, err := cgs.generateContentWithGemini(
		ctx,
		query,
		classContext.String(),
		includeCodeExamples,
		includeDiagrams,
	)
	if err != nil {
		return nil, fmt.Errorf("failed to generate study material: %w", err)
	}

	material := &GeneratedStudyMaterial{
		ID:          uuid.New().String(),
		Query:       query,
		Title:       title,
		Content:     generatedContent,
		Format:      "markdown",
		SourceCount: len(embeddingResults),
		GeneratedAt: time.Now(),
	}

	return material, nil
}

// generateContentWithGemini generates study material using Gemini
func (cgs *ContentGenerationService) generateContentWithGemini(
	ctx context.Context,
	query string,
	classContext string,
	includeCodeExamples bool,
	includeDiagrams bool,
) (string, string, error) {

	client, err := genai.NewClient(ctx, option.WithAPIKey(cgs.geminiEmbedder.GetAPIKey()))
	if err != nil {
		return "", "", fmt.Errorf("failed to create Gemini client: %w", err)
	}
	defer client.Close()

	model := client.GenerativeModel("gemini-1.5-flash")
	model.SetTemperature(0.7)

	// Build comprehensive prompt
	prompt := cgs.buildGenerationPrompt(query, classContext, includeCodeExamples, includeDiagrams)

	// Generate response
	resp, err := model.GenerateContent(ctx, genai.Text(prompt))
	if err != nil {
		return "", "", fmt.Errorf("failed to generate content: %w", err)
	}

	if len(resp.Candidates) == 0 || len(resp.Candidates[0].Content.Parts) == 0 {
		return "", "", fmt.Errorf("no content in response")
	}

	generatedContent := fmt.Sprintf("%v", resp.Candidates[0].Content.Parts[0])

	// Extract title from content (first line if it starts with #)
	lines := strings.Split(generatedContent, "\n")
	title := query
	if len(lines) > 0 && strings.HasPrefix(lines[0], "# ") {
		title = strings.TrimPrefix(lines[0], "# ")
	}

	return generatedContent, title, nil
}

// buildGenerationPrompt constructs the prompt for content generation
func (cgs *ContentGenerationService) buildGenerationPrompt(
	query string,
	classContext string,
	includeCodeExamples bool,
	includeDiagrams bool,
) string {

	var prompt strings.Builder

	prompt.WriteString("You are an expert educational content creator. Generate comprehensive, well-structured study materials.\n\n")

	prompt.WriteString("TASK: Create detailed study notes on the following topic:\n")
	prompt.WriteString(fmt.Sprintf("**Topic**: %s\n\n", query))

	prompt.WriteString("CLASS MATERIALS CONTEXT (use this as foundation):\n")
	prompt.WriteString(classContext)
	prompt.WriteString("\n\n")

	prompt.WriteString("REQUIREMENTS:\n")
	prompt.WriteString("1. Start with a clear title using # markdown\n")
	prompt.WriteString("2. Include an overview/introduction section\n")
	prompt.WriteString("3. Organize content with clear headings (##, ###)\n")
	prompt.WriteString("4. Use bullet points for key concepts\n")
	prompt.WriteString("5. Combine class materials with general knowledge for comprehensive coverage\n")

	if includeCodeExamples {
		prompt.WriteString("6. Include relevant code examples in markdown code blocks with language specification\n")
		prompt.WriteString("   Example: ```python\n   code here\n   ```\n")
	}

	if includeDiagrams {
		prompt.WriteString("7. Include ASCII diagrams or use markdown tables for visual representation\n")
		prompt.WriteString("8. Use formatting like boxes, arrows to illustrate concepts\n")
	}

	prompt.WriteString("9. Include practical examples and use cases\n")
	prompt.WriteString("10. End with a summary section\n")
	prompt.WriteString("11. Format as markdown with proper formatting\n\n")

	prompt.WriteString("OUTPUT: Provide well-formatted markdown that can be easily converted to PDF or HTML.\n")
	prompt.WriteString("Make it comprehensive but concise. Use professional formatting and structure.\n")

	return prompt.String()
}

// ExportToMarkdown exports generated material as markdown
func (material *GeneratedStudyMaterial) ExportToMarkdown() string {
	header := fmt.Sprintf("# %s\n\n", material.Title)
	metadata := fmt.Sprintf("*Generated: %s*\n*Sources: %d class materials*\n\n",
		material.GeneratedAt.Format("2006-01-02 15:04:05"), material.SourceCount)
	
	return header + metadata + material.Content
}

// ExportToHTML exports generated material as basic HTML
func (material *GeneratedStudyMaterial) ExportToHTML() string {
	htmlContent := fmt.Sprintf(`<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>%s</title>
    <style>
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 900px;
            margin: 0 auto;
            padding: 20px;
            background: #f5f5f5;
        }
        h1, h2, h3 { color: #2c3e50; }
        code {
            background: #f4f4f4;
            padding: 2px 6px;
            border-radius: 3px;
            font-family: 'Courier New', monospace;
        }
        pre {
            background: #2d2d2d;
            color: #f8f8f2;
            padding: 15px;
            border-radius: 5px;
            overflow-x: auto;
        }
        pre code { background: none; color: #f8f8f2; padding: 0; }
        .metadata {
            color: #666;
            font-size: 0.9em;
            margin-bottom: 20px;
            border-bottom: 1px solid #ddd;
            padding-bottom: 10px;
        }
        table { border-collapse: collapse; width: 100%%; }
        th, td { border: 1px solid #ddd; padding: 12px; text-align: left; }
        th { background: #f0f0f0; }
        blockquote { border-left: 4px solid #2c3e50; margin: 0; padding-left: 15px; }
    </style>
</head>
<body>
    <h1>%s</h1>
    <div class="metadata">
        Generated: %s<br>
        Sources: %d class materials
    </div>
    <div class="content">
        %s
    </div>
</body>
</html>`,
		material.Title,
		material.Title,
		material.GeneratedAt.Format("2006-01-02 15:04:05"),
		material.SourceCount,
		markdownToHTML(material.Content),
	)
	return htmlContent
}

// markdownToHTML is a simple markdown to HTML converter
// In production, use a library like github.com/russross/blackfriday
func markdownToHTML(markdown string) string {
	// This is a simplified version - for production, use a proper markdown library
	html := markdown
	
	// Basic conversions
	html = strings.ReplaceAll(html, "\n# ", "\n<h1>")
	html = strings.ReplaceAll(html, "\n## ", "\n<h2>")
	html = strings.ReplaceAll(html, "\n### ", "\n<h3>")
	
	return html
}
