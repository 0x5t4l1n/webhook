import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Webhook Logger",
  description: "Inspect and log webhook requests in real-time",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
