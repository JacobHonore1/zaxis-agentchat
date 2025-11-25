export const metadata = {
  title: "Virtuo Assistent MVP",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body
        style={{
          margin: 0,
          padding: 0,
          overflow: "hidden",        // Ingen browser-scrollbars
          background: "#002233",     // Sikrer ingen hvid kant
          fontFamily: "Inter, sans-serif",
          height: "100vh",
          width: "100vw",
        }}
      >
        {children}
      </body>
    </html>
  );
}
