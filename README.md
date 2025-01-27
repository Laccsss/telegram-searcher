# Telegram Channel Search

A simple static website that allows users to search through a curated list of Telegram channels.

## Features
- Search channels by name, description, and categories
- Dark/Light theme support
- Responsive design
- No backend required - works with static JSON

## Deployment to Netlify

1. Fork or clone this repository
2. Sign up for Netlify (if you haven't already)
3. Connect your repository to Netlify
4. Deploy! Netlify will automatically detect the configuration

## Updating Channels

To update the list of channels:

1. Edit the `public/channels.json` file
2. Commit and push your changes
3. Netlify will automatically redeploy with the updated channels

### Channel Format

Each channel in `channels.json` should follow this format:
```json
{
  "name": "Channel Name",
  "link": "https://t.me/channelname",
  "categories": ["category1", "category2"],
  "description": "Channel description"
}
```

## Local Development

To test locally, you can use any static file server. For example:
```bash
npx serve public
```

## Structure
- `public/` - All static files
  - `index.html` - Main search interface
  - `channels.json` - Channel data
  - `styles.css` - Styles
  - `script.js` - Main functionality
- `netlify.toml` - Netlify configuration 