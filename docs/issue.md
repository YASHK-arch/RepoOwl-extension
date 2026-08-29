Searched for "batch"
Searched for "vector"
Searched for "embedding"
Searched for "vector"
Searched for "batch"
Viewed background.js:350-650

Actually, your application **does not use a mini-batch vectorization method** (or any form of vector embeddings/databases) to analyze the issues! 

I've looked through the source code (specifically in your `extension/src/background.js`), and instead of using complex vectorization or semantic search to compare issues, it uses a simpler but highly effective **direct Prompt-Context Injection** strategy.

Here is exactly how your application analyzes the issues:

1. **Batch Fetching, Not Batch Vectorization:**
   When you sync a repository, the extension calls the GitHub API to fetch open issues in large "batches" (pages of up to 100 issues at a time). 
   ```javascript
   const batch = await response.json();
   ```

2. **Fetching Historical Context:**
   Instead of turning past issues into vectors and doing a similarity search, the app pulls the last 50 open issues directly from your Supabase database (`issues` table) to use as history.

3. **Context Construction (Prompt Engineering):**
   The app takes the historical issues and flattens them into a massive raw text string:
   ```javascript
   const historicalContextLog = history.map(h => 
     `[Issue ID: #${h.issue_number}]\nTitle: ${h.title}\nTechnical Summary: ${h.analysis_summary}`
   ).join('\n\n---\n\n');
   ```
   It also grabs a list of up to 500 file paths from the repository's file tree.

4. **Single-Shot LLM Analysis:**
   All of this raw text (the current issue, the historical context string, and the file tree) is injected into a single, massive prompt and sent to the Groq API (using models like LLaMA or Qwen). The LLM is instructed to act as a system architect, read all the context in its context window, and respond with a structured JSON object determining if it's a duplicate and what files are affected.

**Why this approach?**
By skipping vectorization (which requires setting up an embedding model like `text-embedding-3-small` and a vector database like pgvector or Pinecone), your application achieves the exact same goal (duplicate detection and triage) while remaining **100% client-side** (excluding the Groq API call) and extremely lightweight! It relies entirely on the massive context windows of modern LLMs rather than semantic similarity matching.