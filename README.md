# Stylo

An Electron application with a transparent floating interface for macOS, featuring AI-powered text enhancement capabilities.

## Features

- **Floating Interface**: Transparent window that stays above other applications
- **Liquid Glass Effect**: Transparency and background blur for a modern look
- **Smooth Animations**: Seamless transitions between button states
- **4 Action Buttons**:
  - Text Rephrasing
  - Text Translation
  - **Prompt Enhancement** (AI-powered with GPT-4o-mini)
  - Voice Input

## 🚀 New: AI Prompt Enhancement

The **Prompt Enhancer** button (star icon) can now:
- Detect text in any input field, textarea, or contenteditable element
- Send text to Supabase Edge Function for AI processing
- Enhance prompts using GPT-4o-mini via OpenAI API
- Replace original text with AI-enhanced version
- Work across all web applications and websites

## Installation

1. Install dependencies:
```bash
npm install
```

2. Launch the application:
```bash
npm start
```

3. For development mode:
```bash
npm run dev
```

## Usage

### Basic Interface
- **Clicking buttons**: Changes the active state and triggers the action
- **Keyboard Shortcuts**:
  - `1`: Rephrase text
  - `2`: Translate text
  - `3`: **Enhance prompt with AI** (star button)
  - `4`: Activate voice input

### AI Prompt Enhancement
1. **Type text** in any input field, textarea, or contenteditable element on any website
2. **Click the star button** (Prompt Enhancer) in the floating interface
3. **Watch** as your text gets enhanced by GPT-4o-mini
4. **The enhanced text** automatically replaces your original text

### Supported Input Types
- `<input type="text">`
- `<input type="search">`
- `<input type="email">`
- `<textarea>`
- `[contenteditable="true"]` elements

## Design

- **Active buttons**: Black 100% opacity with scale animation
- **Inactive buttons**: Black 30% opacity (gray/transparent)
- **Hover state**: Black 60% opacity
- **Animations**: Cubic-bezier transitions for smooth effects
- **Glass effect**: Backdrop-filter with transparency
- **Minimalistic Apple vibe**: Clean, transparent design

## Setup for AI Features

### 1. Supabase Configuration
```bash
# Install Supabase CLI
npm install -g supabase

# Initialize and link your project
supabase init
supabase link --project-ref YOUR_PROJECT_REF

# Deploy the Edge Function
supabase functions deploy enhance-prompt
```

### 2. Environment Variables
Create `.env.local` in `supabase-functions/enhance-prompt/`:
```env
OPENAI_API_KEY=your_openai_api_key_here
```

### 3. Update Configuration
Edit `script.js` and replace:
- `YOUR_PROJECT_REF` with your Supabase project reference
- `YOUR_ANON_KEY` with your Supabase anonymous key

## Testing

Open `test-page.html` in your browser to test the AI enhancement feature with various input types.

## Project Structure

```
├── main.js                    # Main Electron process
├── index.html                 # User interface
├── styles.css                 # Styles and animations
├── script.js                  # Interaction logic + AI features
├── config.js                  # Configuration file
├── test-page.html             # Test page for AI features
├── icone/                     # SVG icons directory
├── supabase-functions/        # Supabase Edge Functions
│   ├── enhance-prompt/        # AI enhancement function
│   ├── rephrase-text/         # Text rephrasing function
│   ├── translate-text/        # Text translation function
│   ├── voice-processing/      # Voice processing function
│   └── functions-config.json  # Functions configuration
├── supabase/                  # Supabase configuration
│   └── config.toml           # Supabase config
├── env.example               # Environment variables template
└── package.json              # Project configuration
```
