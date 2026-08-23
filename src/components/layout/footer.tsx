import * as React from "react";
import Link from "next/link";
import { Container } from "./container";
import { Divider } from "../ui/divider";

export function Footer() {
  return (
    <footer className="bg-background py-12 md:py-16">
      <Container>
        <Divider className="mb-12" />
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
          <div className="flex flex-col space-y-4">
            <h3 className="font-bold text-xl tracking-tight">KOMITKABE Gathering XXVI</h3>
            <p className="text-muted-foreground max-w-sm">
              TWO DECADES, THE NEXT CHAPTER
            </p>
          </div>
          
          <div className="flex flex-col space-y-4 md:items-end">
            <nav className="flex flex-col space-y-3 md:items-end">
              <Link href="/" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
                Home
              </Link>
              <Link href="/news" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
                News
              </Link>
              <Link href="/register" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
                Register
              </Link>
              <Link href="/registration" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
                Check Registration
              </Link>
            </nav>
          </div>
        </div>

        <div className="flex flex-col md:flex-row items-center justify-between pt-8 border-t border-border">
          <p className="text-sm text-muted-foreground mb-4 md:mb-0">
            &copy; {new Date().getFullYear()} KOMITKABE. All rights reserved.
          </p>
          <p className="text-sm text-muted-foreground">
            Crafted with ☕ by{" "}
            <a 
              href="https://trisf.id/" 
              target="_blank" 
              rel="noopener noreferrer"
              className="font-medium text-foreground hover:underline transition-all"
            >
              τяιѕƒ
            </a>
          </p>
        </div>
      </Container>
    </footer>
  );
}
