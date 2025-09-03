# College Gallery

A web application built with **Next.js**, **TypeScript**, and **Tailwind CSS**.  
The project provides a foundation for building modern, fast, and scalable apps.

---

## Tech Stack
- [Next.js](https://nextjs.org/) – React framework for server-side rendering and static sites
- [TypeScript](https://www.typescriptlang.org/) – Strongly typed JavaScript
- [Tailwind CSS](https://tailwindcss.com/) – Utility-first CSS framework
- PostCSS – For CSS transformations
- ESLint + Prettier – Code quality and formatting

---

## Getting Started

### Prerequisites
Make sure you have:
- [Node.js](https://nodejs.org/) (>=18.x)
- [npm](https://www.npmjs.com/) or [yarn](https://yarnpkg.com/)

### Installation
Clone the repo and install dependencies:

```bash
git clone https://github.com/pranavncode/college-gallery.git
cd college-gallery
npm install
```

### Development
Run the development server:

```bash
npm run dev
```

Then open [http://localhost:3000](http://localhost:3000) in your browser.

### Production Build
```bash
npm run build
npm run start
```

---

## Project Structure
```
college-gallery/
├── src/
│   ├── app/        # Next.js app directory (pages, layouts)
│   ├── components/ # Reusable UI components
│   └── styles/     # Global styles
├── public/         # Static assets
├── package.json    # Scripts and dependencies
├── next.config.ts  # Next.js configuration
└── tailwind.config.ts
```

---

## Scripts
Common commands:
- `npm run dev` – Start dev server
- `npm run build` – Build for production
- `npm run start` – Run production server
- `npm run lint` – Lint codebase

---

## Contributing
1. Fork the repo
2. Create a new branch:  
   ```bash
   git checkout -b feature-name
   ```
3. Commit changes:  
   ```bash
   git commit -m "Add feature"
   ```
4. Push and open a Pull Request

---

## License
This project is licensed under the [MIT License](LICENSE).
