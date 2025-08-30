'use client';

import { useEffect } from 'react';

interface ClientLayoutProps {
  children: React.ReactNode;
}

export default function ClientLayout({ children }: ClientLayoutProps) {
  useEffect(() => {
    // Handle any VS Code extension attributes that might be added during development
    const htmlElement = document.documentElement;
    
    // Remove any VS Code extension attributes that might cause hydration issues
    const vscAttributes = htmlElement.getAttributeNames().filter(name => 
      name.startsWith('--vsc-') || name.includes('vsc-')
    );
    
    vscAttributes.forEach(attr => {
      htmlElement.removeAttribute(attr);
    });
    
    // Clean up any other potential hydration mismatches
    const bodyElement = document.body;
    const bodyVscAttributes = bodyElement.getAttributeNames().filter(name => 
      name.startsWith('--vsc-') || name.includes('vsc-')
    );
    
    bodyVscAttributes.forEach(attr => {
      bodyElement.removeAttribute(attr);
    });

    // Handle drag-and-drop related attributes that might cause hydration issues
    const allElements = document.querySelectorAll('*');
    allElements.forEach(element => {
      const dragAttributes = element.getAttributeNames().filter(name => 
        name.startsWith('aria-describedby') && name.includes('DndDescribedBy')
      );
      
      dragAttributes.forEach(attr => {
        element.removeAttribute(attr);
      });
    });
  }, []);

  return <>{children}</>;
}
