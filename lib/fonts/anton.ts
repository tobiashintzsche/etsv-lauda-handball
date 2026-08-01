import { Anton } from "next/font/google";

/**
 * Anton carries the Instagram matchday posts (Figma spieltagspost screens)
 * and their web adaptation in the next-games section. Single cut — the face
 * has no other weights or styles.
 */
export const anton = Anton({
  subsets: ["latin"],
  weight: "400",
  display: "swap",
  variable: "--font-anton",
});
