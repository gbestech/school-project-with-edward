declare module 'jspdf' {
  export default class jsPDF {
    constructor(orientation?: string, unit?: string, format?: string);
    setFontSize(size: number): void;
    setFont(fontName: string, fontStyle?: string): void;
    text(text: string, x: number, y: number): void;
    setPage(pageNumber: number): void;
    autoTable(options: any): void;
    save(filename: string): void;
    internal: {
      pageSize: {
        getWidth(): number;
        getHeight(): number;
      };
      getNumberOfPages(): number;
    };
  }
}

declare module 'jspdf-autotable' {
  // This module extends jsPDF with autoTable functionality
} 