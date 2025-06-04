# BunLLM

A CLI tool that helps you add LLM documentation to your project based on your package.json dependencies. This tool makes it easy to provide AI tools (like Cursor) with relevant documentation about your project's dependencies.

## Purpose

When working with AI tools like Cursor, having access to relevant documentation about your project's dependencies can significantly improve the AI's ability to help you. BunLLM helps you:

1. Identify which of your project's dependencies have available LLM documentation
2. Select which documentation versions you want (full or tiny)
3. Automatically copy the selected documentation to your project
4. Make the documentation easily accessible to AI tools

## Installation

```bash
# Install globally
bun install -g bunllm

# Or run directly using bunx
bunx bunllm
```

## Usage

1. Navigate to your project directory (the one containing your package.json)
2. Run the tool:
```bash
bunllm
```

3. The tool will:
   - Show you all your dependencies with ✅ or ❌ indicating if documentation is available
   - Let you select which packages you want documentation for
   - For each selected package, let you choose between full or tiny documentation
   - Copy the selected documentation to a `.llm-docs` directory in your project

## Documentation Structure

The documentation is stored in the following structure:
```
docs/
  ├── mapping.json    # Maps packages to their documentation files
  ├── package-full.txt  # Full documentation for a package
  └── package-tiny.txt  # Condensed documentation for a package
```

The `mapping.json` file looks like this:
```json
{
  "package-name": {
    "full": "package-full.txt",
    "tiny": "package-tiny.txt"
  }
}
```

## Using with AI Tools

After running BunLLM, you'll have a `.llm-docs` directory in your project containing the selected documentation files. These files can be used by AI tools to better understand your project's dependencies.

For example, with Cursor, you can reference these files in your rules to help the AI understand specific packages better.

## Contributing

We welcome contributions! If you want to add documentation for a new package:

1. Create the documentation files in the `docs` directory
2. Add an entry to `docs/mapping.json`
3. Submit a pull request

## Requirements

- Bun runtime
- TypeScript 5.0 or higher

## License

MIT
