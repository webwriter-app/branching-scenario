// Represents a choice leading to another page
export interface Choice {
  text: string;
  targetPageId: number;
}

// Represents a single page in the gamebook
export interface Page {
  id: number;
  title: string;
  content: string;
  //choices: Choice[];
}

export class Gamebook {
  pages: [number, Page][];
  currentPageId: number;

  constructor() {
    this.pages = [];
    this.currentPageId = 0;
  }

  // Add a new page to the gamebook
  addPage(page: Page): void {
    this.pages.push([page.id, page]);
  }

  //remove a specific page from the gamebook
  removePage(pageId: number): void {
    this.pages = this.pages.filter((page) => page[0] != pageId);
  }

  //remove all pages from the gamebook
  clearPages(): void {
    this.pages = [];
  }

  //Returns
  getPageIndex(pageId: number): number {
    let index = -1;
    for (let i = 0; i < this.pages.length; i++) {
      if (pageId == this.pages[i][0]) {
        index = i;
        return index;
      }
    }
    //not found
    return -1;
  }

  //returns all pages in an arry
  getAllPages(): Page[] {
    return this.pages.map(([_, page]) => page);
  }

  saveChangesToPageContent(pageId: number, newContent: string): void {
    let index = this.getPageIndex(pageId);
    this.pages[index][1].content = newContent;
  }

  saveChangesToPageName(pageId: number, newName: string): void {
    let index = this.getPageIndex(pageId);
    this.pages[index][1].title = newName;
  }

  // Navigate to a page by its ID
  navigateToPage(pageId: number): boolean {
    if (this.getPageIndex(pageId) != -1) {
      this.currentPageId = pageId;
      return true;
    }
    return false;
  }
}
