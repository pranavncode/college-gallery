export function Footer() {
  return (
    <footer className="border-t py-8 text-center text-sm text-muted-foreground">
      <div className="container">
        <p>&copy; {new Date().getFullYear()} ClgGallery. All rights reserved.</p>
        <p className="mt-1">Connecting campus memories, one click at a time.</p>
      </div>
    </footer>
  );
}
