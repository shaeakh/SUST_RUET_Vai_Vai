# Intelligent Search Setup Instructions

## Sample Files Setup

For the search functionality to work with PDF and PPTX previews, you need to copy the sample files to the `public` folder:

1. Copy files from `sample_files/` to `public/sample_files/`:

   ```bash
   # Windows PowerShell
   Copy-Item -Path "sample_files\*" -Destination "public\sample_files\" -Recurse -Force

   # Or manually copy:
   # sample_files/ClassWork1.pdf -> public/sample_files/ClassWork1.pdf
   # sample_files/ClassWork2.pptx -> public/sample_files/ClassWork2.pptx
   ```

2. Ensure the `public/sample_files/` directory exists before copying.

## Features Implemented

✅ Enhanced material data structure with tags, description, content, and syntax tokens
✅ Intelligent search algorithm with multi-factor relevance scoring:

- Tag matching (40% weight)
- Content/description matching (30% weight)
- Syntax-aware code matching (20% weight for code files)
- File name matching (10% weight)
  ✅ Debounced search input (300ms delay)
  ✅ Top 5 results display with relevance scores
  ✅ File preview dialog for:
- PDF files (iframe preview)
- PPTX files (download option)
- Code files (syntax-highlighted preview)
  ✅ Tag highlighting in search results
  ✅ Query term highlighting in descriptions

## Usage

1. Navigate to any course page
2. Use the search bar at the top to search for materials
3. Click on any search result to preview the file
4. Use the preview dialog to download or open files in a new tab

## Search Examples

- "C++" - Finds all C++ related materials
- "algorithms" - Finds algorithm-related content
- "week 1" - Finds Week 1 materials
- "sorting" - Finds sorting algorithm implementations
- "OOP" - Finds object-oriented programming materials
