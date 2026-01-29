/**
 * PDF Generator Utility
 *
 * Converts Markdown content to PDF using @react-pdf/renderer
 * This is a client-side utility that generates PDFs in the browser
 */

import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  pdf,
  Font,
} from "@react-pdf/renderer";
import type { ReactElement } from "react";

// Register fonts (using system fonts as fallback)
Font.register({
  family: "Inter",
  fonts: [
    {
      src: "https://fonts.gstatic.com/s/inter/v13/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuLyfAZ9hjp-Ek-_EeA.woff2",
      fontWeight: 400,
    },
    {
      src: "https://fonts.gstatic.com/s/inter/v13/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuI6fAZ9hjp-Ek-_EeA.woff2",
      fontWeight: 600,
    },
    {
      src: "https://fonts.gstatic.com/s/inter/v13/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuFuYAZ9hjp-Ek-_EeA.woff2",
      fontWeight: 700,
    },
  ],
});

// PDF Styles
const styles = StyleSheet.create({
  page: {
    flexDirection: "column",
    backgroundColor: "#ffffff",
    padding: 40,
    fontFamily: "Inter",
  },
  header: {
    marginBottom: 20,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
  },
  title: {
    fontSize: 24,
    fontWeight: 700,
    color: "#111827",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 12,
    color: "#6b7280",
  },
  content: {
    flex: 1,
  },
  h1: {
    fontSize: 20,
    fontWeight: 700,
    color: "#111827",
    marginTop: 16,
    marginBottom: 8,
  },
  h2: {
    fontSize: 16,
    fontWeight: 600,
    color: "#1f2937",
    marginTop: 14,
    marginBottom: 6,
  },
  h3: {
    fontSize: 14,
    fontWeight: 600,
    color: "#374151",
    marginTop: 12,
    marginBottom: 4,
  },
  paragraph: {
    fontSize: 11,
    lineHeight: 1.6,
    color: "#374151",
    marginBottom: 10,
    textAlign: "justify",
  },
  listItem: {
    fontSize: 11,
    lineHeight: 1.5,
    color: "#374151",
    marginBottom: 4,
    paddingLeft: 15,
  },
  bulletPoint: {
    position: "absolute",
    left: 0,
  },
  codeBlock: {
    backgroundColor: "#f3f4f6",
    padding: 10,
    borderRadius: 4,
    marginVertical: 8,
    fontFamily: "Courier",
    fontSize: 10,
  },
  inlineCode: {
    backgroundColor: "#f3f4f6",
    paddingHorizontal: 4,
    paddingVertical: 2,
    borderRadius: 2,
    fontFamily: "Courier",
    fontSize: 10,
  },
  blockquote: {
    borderLeftWidth: 3,
    borderLeftColor: "#d1d5db",
    paddingLeft: 12,
    marginVertical: 8,
    fontStyle: "italic",
    color: "#6b7280",
  },
  footer: {
    position: "absolute",
    bottom: 30,
    left: 40,
    right: 40,
    flexDirection: "row",
    justifyContent: "space-between",
    fontSize: 10,
    color: "#9ca3af",
  },
  pageNumber: {
    fontSize: 10,
    color: "#9ca3af",
  },
});

// Parse markdown to PDF elements
function parseMarkdownToPDF(markdown: string): ReactElement[] {
  const lines = markdown.split("\n");
  const elements: ReactElement[] = [];
  let currentList: string[] = [];
  let inCodeBlock = false;
  let codeContent = "";
  let listType: "ul" | "ol" | null = null;

  const flushList = () => {
    if (currentList.length > 0) {
      elements.push(
        <View key={`list-${elements.length}`} style={{ marginBottom: 8 }}>
          {currentList.map((item, idx) => (
            <View key={idx} style={{ flexDirection: "row", marginBottom: 4 }}>
              <Text style={styles.bulletPoint}>
                {listType === "ol" ? `${idx + 1}.` : "•"}
              </Text>
              <Text style={styles.listItem}>{item}</Text>
            </View>
          ))}
        </View>,
      );
      currentList = [];
      listType = null;
    }
  };

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // Code block handling
    if (line.startsWith("```")) {
      if (inCodeBlock) {
        elements.push(
          <View key={`code-${i}`} style={styles.codeBlock}>
            <Text>{codeContent}</Text>
          </View>,
        );
        codeContent = "";
        inCodeBlock = false;
      } else {
        flushList();
        inCodeBlock = true;
      }
      continue;
    }

    if (inCodeBlock) {
      codeContent += (codeContent ? "\n" : "") + line;
      continue;
    }

    // Empty line
    if (!line.trim()) {
      flushList();
      continue;
    }

    // Headings
    if (line.startsWith("# ")) {
      flushList();
      elements.push(
        <Text key={`h1-${i}`} style={styles.h1}>
          {line.slice(2)}
        </Text>,
      );
      continue;
    }

    if (line.startsWith("## ")) {
      flushList();
      elements.push(
        <Text key={`h2-${i}`} style={styles.h2}>
          {line.slice(3)}
        </Text>,
      );
      continue;
    }

    if (line.startsWith("### ")) {
      flushList();
      elements.push(
        <Text key={`h3-${i}`} style={styles.h3}>
          {line.slice(4)}
        </Text>,
      );
      continue;
    }

    // Blockquote
    if (line.startsWith("> ")) {
      flushList();
      elements.push(
        <View key={`quote-${i}`} style={styles.blockquote}>
          <Text style={styles.paragraph}>{line.slice(2)}</Text>
        </View>,
      );
      continue;
    }

    // Unordered list
    if (line.match(/^[-*]\s/)) {
      if (listType !== "ul") {
        flushList();
        listType = "ul";
      }
      currentList.push(line.slice(2).trim());
      continue;
    }

    // Ordered list
    if (line.match(/^\d+\.\s/)) {
      if (listType !== "ol") {
        flushList();
        listType = "ol";
      }
      currentList.push(line.replace(/^\d+\.\s/, "").trim());
      continue;
    }

    // Regular paragraph
    flushList();

    // Process inline formatting (simplified)
    let text = line;
    // Remove markdown formatting for PDF (bold, italic, code)
    text = text.replace(/\*\*(.+?)\*\*/g, "$1"); // bold
    text = text.replace(/\*(.+?)\*/g, "$1"); // italic
    text = text.replace(/`(.+?)`/g, "$1"); // inline code
    text = text.replace(/\[(.+?)\]\(.+?\)/g, "$1"); // links

    elements.push(
      <Text key={`p-${i}`} style={styles.paragraph}>
        {text}
      </Text>,
    );
  }

  flushList();
  return elements;
}

interface PDFDocumentProps {
  title: string;
  content: string;
  generatedAt?: Date;
}

// PDF Document Component
function PDFDocument({
  title,
  content,
  generatedAt = new Date(),
}: PDFDocumentProps) {
  const elements = parseMarkdownToPDF(content);

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.subtitle}>
            Generated on {generatedAt.toLocaleDateString()} • AI Learning
            Assistant
          </Text>
        </View>
        <View style={styles.content}>{elements}</View>
        <View style={styles.footer} fixed>
          <Text>BCF Learning Platform</Text>
          <Text
            style={styles.pageNumber}
            render={({
              pageNumber,
              totalPages,
            }: {
              pageNumber: number;
              totalPages: number;
            }) => `Page ${pageNumber} of ${totalPages}`}
          />
        </View>
      </Page>
    </Document>
  );
}

/**
 * Generate PDF from markdown content
 * Returns a Blob that can be downloaded
 */
export async function generatePDF(
  title: string,
  markdown: string,
): Promise<Blob> {
  const doc = <PDFDocument title={title} content={markdown} />;
  const blob = await pdf(doc).toBlob();
  return blob;
}

/**
 * Download PDF with a given filename
 */
export function downloadPDF(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename.endsWith(".pdf") ? filename : `${filename}.pdf`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Generate and download PDF in one step
 */
export async function generateAndDownloadPDF(
  title: string,
  markdown: string,
  filename?: string,
): Promise<void> {
  const blob = await generatePDF(title, markdown);
  downloadPDF(blob, filename || title);
}
