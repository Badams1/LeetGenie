# 💡 LeetGenie - Smart Hints for LeetCode

![LeetGenie Icon](icon128.png)

**LeetGenie** is a Chrome extension that provides intelligent hints for LeetCode problems without spoiling the solution. Get unstuck with AI-powered guidance that helps you think through problems step by step.

## ✨ Features

- 🧠 **Smart Hints**: AI-powered hints that guide your thinking without giving away the answer
- 🎯 **Context-Aware**: Analyzes your current code and the problem to provide relevant guidance
- 🚀 **Zero Configuration**: No setup required - works out of the box
- 🎨 **Clean UI**: Seamlessly integrates into LeetCode's interface
- ⚡ **Fast Response**: Quick hints powered by GPT-3.5 Turbo
- 🌙 **Dark Mode**: Beautiful dark-themed popup that matches modern UI design

## 🚀 Installation

### Option 1: Chrome Web Store (Coming Soon)
*The extension will be available on the Chrome Web Store soon.*

### Option 2: Developer Mode (Current)

1. **Download the Extension**:
   - Clone this repository or download as ZIP
   - Extract to a folder on your computer

2. **Load in Chrome**:
   - Open Chrome and go to `chrome://extensions/`
   - Enable "Developer mode" (toggle in top right)
   - Click "Load unpacked"
   - Select the `LeetGenie` folder

3. **Start Using**:
   - Navigate to any LeetCode problem
   - Look for the "Get Hint" button in the header tabs (next to Description, Editorial, Solutions)
   - Click to get intelligent hints!

## 🎯 How It Works

1. **Navigate** to any LeetCode problem page
2. **Code** your solution or get stuck on an approach
3. **Click** the "Get Hint" button in the header
4. **Receive** a helpful hint that guides your thinking without spoiling the solution
5. **Continue** coding with new insights!

## 🛠️ Technical Details

- **Manifest V3**: Latest Chrome extension format
- **AI Integration**: Uses OpenAI's GPT-3.5 Turbo for intelligent hints
- **Smart Code Detection**: Automatically detects your code using Monaco Editor, CodeMirror, or textarea fallbacks
- **Problem Analysis**: Extracts problem title and description for context-aware hints
- **Responsive Design**: Works on all screen sizes and integrates seamlessly with LeetCode's UI

## 📁 Project Structure

```
LeetGenie/
├── manifest.json          # Extension configuration
├── background.js          # Service worker for API calls
├── content.js            # Content script for UI injection
├── content.css           # Styling for the extension
├── icon16.png            # 16x16 icon
├── icon32.png            # 32x32 icon
├── icon48.png            # 48x48 icon
├── icon128.png           # 128x128 icon
├── icon.svg              # Source SVG icon
├── generate-icons.html   # Icon generation utility
└── README.md             # This file
```

## 🎨 Icon Generation

The extension includes a utility to generate icons from the source SVG:

1. Open `generate-icons.html` in your browser
2. Click "🚀 Generate All Icons"
3. Download the generated PNG files

## 🔒 Privacy & Security

- **No Data Collection**: LeetGenie doesn't collect or store any personal data
- **Local Processing**: All code analysis happens locally in your browser
- **Secure API**: Only problem text and your code are sent to OpenAI for hint generation
- **No Tracking**: No analytics or user tracking

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- OpenAI for providing the GPT API
- LeetCode for the amazing platform
- The Chrome Extensions team for the excellent documentation

---

**Happy Coding! 🚀**

*Made with ❤️ for the competitive programming community* 