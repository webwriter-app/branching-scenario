// Represents a choice leading to another page
export interface Link {
  targetPageId: number;
}

export interface QuizBranch {
  question: string;
}

export interface Answer {
  id: number;
  text: string;
  targetPageId: string;
  isCorrect: boolean;
}

// Represents a single page in the gamebook
export interface Page {
  id: number;
  title: string;
  content: string;
  links: Link[];
}

export interface QuizBranch {
  id: number;
}

export class Gamebook {
  title: string;
  originPageId: number;
  pages: [number, Page][];
  currentPageId: number;

  constructor() {
    this.title = "Untitled";
    this.pages = [];
    this.currentPageId = 0;
  }

  // Add a new page to the gamebook
  addPage(page: Page): void {
    if (this.pages.length == 0) {
      this.originPageId = page.id;
    }
    this.pages.push([page.id, page]);
  }

  //remove a specific page from the gamebook
  removePage(pageId: number): void {
    this.pages = this.pages.filter((page) => page[0] != pageId);
  }

  //remove all pages from the gamebook
  clearPages(): void {
    this.pages = [];
    this.originPageId = null;
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

  addLinkToPage(pageId: number, targetPageId: number): void {
    const link: Link = {
      targetPageId: targetPageId,
    };

    this.pages[this.getPageIndex(pageId)][1].links.push(link);
  }

  startGamebook(): Page {
    //first page in array is always origin
    //TODO: introduce origin ID attribute
    this.currentPageId = this.pages[0][1].id;
    return this.pages[0][1];
  }

  navigateWithLink(targetPageId: number): boolean {
    let currPage = this.pages[this.getPageIndex(this.currentPageId)][1];
    // Check if the page has a links array
    if (currPage.links) {
      // Check if any link in the links array has the targetPageId
      let linkExists = currPage.links.some(
        (link) => link.targetPageId == targetPageId
      );

      if (linkExists) {
        return this.navigateToPage(targetPageId);
      } else {
        return false;
      }
    } else {
      return false;
    }
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
