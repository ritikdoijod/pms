import { Poppins } from "next/font/google";
import "@/app/globals.css";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
});

const RootLayout = ({ children }) => (
  <html lang="en">
    <body className={poppins.className}>{children}</body>
  </html>
);

export default RootLayout;
