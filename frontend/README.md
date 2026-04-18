# Interactive UI with Animations

Modern React application with beautiful interactive animations and particle effects.

## Installation

```bash
npm install
```

## Development

```bash
npm run dev
```

The application will start at `http://localhost:5173`

## Building

```bash
npm run build
```

## Preview

```bash
npm run preview
```

## Features

- ✨ Smooth CSS animations (fade, slide, bounce, rotate, scale)
- 🎨 Canvas-based particle effects
- 🔄 Interactive counter with API integration
- 📱 Fully responsive design
- 🎯 Real-time API status indicator
- ⚡ Fast development with Vite

## API Integration

The UI connects to the FastAPI backend at `http://localhost:8000`

### Endpoints Used:

- `GET /api/animation` - Fetch animation data
- `POST /api/counter` - Process counter calculations
- `GET /health` - Check API health status

## Components

- **ParticleAnimation**: Canvas-based particle effects
- **AnimatedButton**: Interactive buttons with ripple effects
- **CounterAnimation**: Interactive counter with API calls
- **FadeInText**: Text animations with various effects

## Animations Included

- Fade in/out
- Slide in/out
- Bounce
- Pulse
- Rotate
- Scale
- Ripple effect on buttons
- Particle movement

## Customization

All animations can be customized in the CSS files within the `src/components` directory.
