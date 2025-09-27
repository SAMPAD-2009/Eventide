
import fs from 'fs';
import path from 'path';

// This function is not 'async' because we are in a server component
// and can read the file synchronously during the build process.
function getTermsContent() {
  // Construct the full path to the TERMS.md file
  const filePath = path.join(process.cwd(), 'TERMS.md');
  try {
    // Read the file content
    const content = fs.readFileSync(filePath, 'utf8');
    return content;
  } catch (error) {
    console.error("Could not read TERMS.md:", error);
    return "The terms and conditions could not be loaded. Please try again later.";
  }
}

// A simple component to render markdown-like text into basic HTML
const MarkdownRenderer = ({ content }: { content: string }) => {
    const lines = content.split('\n');
    const elements = lines.map((line, index) => {
        if (line.startsWith('## ')) {
            return <h2 key={index} className="text-xl font-semibold mt-6 mb-2">{line.substring(3)}</h2>;
        }
        if (line.startsWith('# ')) {
            return <h1 key={index} className="text-3xl font-bold mt-8 mb-4">{line.substring(2)}</h1>;
        }
        if (line.startsWith('- ')) {
             // This is a simple approach; it doesn't group items into a single <ul>
            return <li key={index} className="ml-6 list-disc">{line.substring(2)}</li>;
        }
        if (line.startsWith('**') && line.endsWith('**')) {
            return <p key={index} className="font-bold my-2">{line.substring(2, line.length - 2)}</p>;
        }
        if (line.trim() === '') {
            return <br key={index} />;
        }
        return <p key={index} className="my-2 leading-relaxed">{line}</p>;
    });

    return <>{elements}</>;
};


export default function TermsPage() {
  const termsContent = getTermsContent();

  return (
    <div className="w-full mx-auto p-4 md:p-8">
      <div className="max-w-3xl mx-auto bg-card p-6 md:p-10 rounded-lg shadow-sm border">
        <MarkdownRenderer content={termsContent} />
      </div>
    </div>
  );
}
