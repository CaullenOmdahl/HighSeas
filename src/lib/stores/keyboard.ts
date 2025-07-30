import { writable } from 'svelte/store';

export interface KeyboardState {
	focusedElement: HTMLElement | null;
	focusableElements: HTMLElement[];
	currentIndex: number;
	gridPosition: { row: number; col: number } | null;
	gridDimensions: { rows: number; cols: number } | null;
}

export const keyboardStore = writable<KeyboardState>({
	focusedElement: null,
	focusableElements: [],
	currentIndex: -1,
	gridPosition: null,
	gridDimensions: null
});

export class KeyboardNavigationManager {
	private focusableElements: HTMLElement[] = [];
	private currentIndex = -1;
	private isActive = false;
	private gridElements: HTMLElement[][] = [];
	private currentRow = 0;
	private currentCol = 0;
	private isGridMode = false;

	constructor() {
		this.bindKeyboardEvents();
	}

	private bindKeyboardEvents() {
		document.addEventListener('keydown', this.handleKeyDown.bind(this));
		// Reset navigation when mouse is used
		document.addEventListener('mousedown', () => {
			this.isActive = false;
			this.currentIndex = -1;
			this.updateStore();
		});
	}

	private handleKeyDown(event: KeyboardEvent) {
		// Only handle navigation keys
		if (!['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Enter', 'Escape'].includes(event.key)) {
			return;
		}

		// Don't interfere with input fields
		if (event.target instanceof HTMLInputElement || event.target instanceof HTMLTextAreaElement) {
			return;
		}

		// Activate keyboard navigation on first directional key press
		if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(event.key)) {
			if (!this.isActive) {
				this.isActive = true;
				this.refreshFocusableElements();
				console.log('🎮 Keyboard navigation activated');
				console.log(`Found ${this.focusableElements.length} focusable elements`);
				console.log(`Grid mode: ${this.isGridMode}`);
				if (this.isGridMode) {
					console.log(`Grid dimensions: ${this.gridElements.length} rows`);
				}
			}
		}

		if (!this.isActive || this.focusableElements.length === 0) {
			console.log('❌ Navigation not active or no focusable elements');
			return;
		}

		event.preventDefault();

		switch (event.key) {
			case 'ArrowRight':
				if (this.isGridMode) {
					this.navigateRight();
				} else {
					this.navigateNext();
				}
				break;
			case 'ArrowLeft':
				if (this.isGridMode) {
					this.navigateLeft();
				} else {
					this.navigatePrevious();
				}
				break;
			case 'ArrowUp':
				if (this.isGridMode) {
					this.navigateUp();
				} else {
					this.navigatePrevious();
				}
				break;
			case 'ArrowDown':
				if (this.isGridMode) {
					this.navigateDown();
				} else {
					this.navigateNext();
				}
				break;
			case 'Enter':
				this.activateCurrentElement();
				break;
			case 'Escape':
				this.deactivate();
				break;
		}

		this.updateStore();
	}

	private refreshFocusableElements() {
		// Check if we should use grid navigation for movie/series content
		const movieRows = document.querySelectorAll('[data-movie-row]');
		const searchResults = document.querySelector('[data-search-results]');
		
		if (movieRows.length > 0 || searchResults) {
			this.setupGridNavigation();
		} else {
			this.setupLinearNavigation();
		}
	}

	private setupGridNavigation() {
		this.isGridMode = true;
		this.gridElements = [];
		
		// Find movie cards in rows or search results
		const movieRows = document.querySelectorAll('[data-movie-row]');
		const searchResults = document.querySelector('[data-search-results]');
		
		console.log(`🎬 Found ${movieRows.length} movie rows`);
		console.log(`🔍 Search results container:`, searchResults ? 'found' : 'not found');
		
		if (searchResults) {
			// Handle search results grid - create a proper grid layout
			const movieCards = Array.from(searchResults.querySelectorAll('[data-movie-card]')) as HTMLElement[];
			console.log(`🎬 Found ${movieCards.length} movie cards in search results`);
			this.createGridFromElements(movieCards);
		} else {
			// Handle movie rows - each row becomes a "row" in our grid
			let actualRowIndex = 0;
			movieRows.forEach((row, originalIndex) => {
				const movieCards = Array.from(row.querySelectorAll('[data-movie-card]')) as HTMLElement[];
				console.log(`🎬 Row ${originalIndex}: found ${movieCards.length} movie cards`);
				if (movieCards.length > 0) {
					const visibleCards = movieCards.filter(card => this.isElementVisible(card));
					console.log(`👁️ Row ${originalIndex}: ${visibleCards.length} visible cards`);
					if (visibleCards.length > 0) {
						// Store the row title for debugging
						const rowTitle = row.querySelector('h2')?.textContent || `Row ${originalIndex}`;
						console.log(`📝 Row ${actualRowIndex}: "${rowTitle}" with ${visibleCards.length} cards`);
						this.gridElements[actualRowIndex] = visibleCards;
						actualRowIndex++;
					}
				}
			});
		}
		
		// Set initial position
		if (this.gridElements.length > 0 && this.gridElements[0] && this.gridElements[0].length > 0) {
			this.currentRow = 0;
			this.currentCol = 0;
			console.log(`✅ Grid navigation ready: ${this.gridElements.length} rows`);
			this.gridElements.forEach((row, index) => {
				console.log(`   Row ${index}: ${row.length} cards`);
			});
		} else {
			console.log(`❌ No valid grid elements found`);
			this.isGridMode = false;
			return;
		}
		
		// Flatten for focusableElements array compatibility
		this.focusableElements = this.gridElements.flat();
		this.currentIndex = 0;
		console.log(`🎯 Total focusable elements: ${this.focusableElements.length}`);
	}

	private createGridFromElements(elements: HTMLElement[]) {
		// Calculate grid dimensions based on container width and card width
		if (elements.length === 0) return;
		
		const container = elements[0].closest('[data-search-results]') as HTMLElement;
		if (!container) return;
		
		const containerWidth = container.getBoundingClientRect().width;
		const cardWidth = elements[0].getBoundingClientRect().width;
		const gap = 16; // Approximate gap between cards
		
		const cardsPerRow = Math.floor((containerWidth + gap) / (cardWidth + gap));
		
		// Create grid structure
		this.gridElements = [];
		for (let i = 0; i < elements.length; i += cardsPerRow) {
			const row = elements.slice(i, i + cardsPerRow).filter(el => this.isElementVisible(el));
			if (row.length > 0) {
				this.gridElements.push(row);
			}
		}
	}

	private setupLinearNavigation() {
		this.isGridMode = false;
		
		// Find all focusable elements except pagination and movie cards
		const selectors = [
			'button:not([disabled]):not([data-pagination]):not([data-movie-card])',
			'[role="button"]:not([disabled]):not([data-pagination]):not([data-movie-card])',
			'a[href]:not([data-pagination]):not([data-movie-card])',
			'input:not([disabled]):not([data-pagination])',
			'select:not([disabled]):not([data-pagination])',
			'[tabindex]:not([tabindex="-1"]):not([data-pagination]):not([data-movie-card])'
		];

		this.focusableElements = Array.from(
			document.querySelectorAll(selectors.join(', '))
		).filter((el): el is HTMLElement => {
			return this.isElementVisible(el as HTMLElement);
		});

		// Start with first element if none selected
		if (this.currentIndex === -1 && this.focusableElements.length > 0) {
			this.currentIndex = 0;
		}
	}

	private isElementVisible(element: HTMLElement): boolean {
		const rect = element.getBoundingClientRect();
		const isVisible = rect.width > 0 && rect.height > 0 && 
			rect.top < window.innerHeight && rect.bottom > 0;
		
		return isVisible && window.getComputedStyle(element).visibility !== 'hidden';
	}

	private navigateNext() {
		if (this.isGridMode) {
			this.navigateRight();
		} else {
			if (this.focusableElements.length === 0) return;
			
			this.currentIndex = (this.currentIndex + 1) % this.focusableElements.length;
			this.focusCurrentElement();
		}
	}

	private navigatePrevious() {
		if (this.isGridMode) {
			this.navigateLeft();
		} else {
			if (this.focusableElements.length === 0) return;
			
			this.currentIndex = this.currentIndex <= 0 
				? this.focusableElements.length - 1 
				: this.currentIndex - 1;
			this.focusCurrentElement();
		}
	}

	private navigateUp() {
		if (!this.isGridMode || this.gridElements.length === 0) {
			console.log('❌ Cannot navigate up - not in grid mode or no elements');
			return;
		}
		
		if (this.currentRow > 0) {
			this.currentRow--;
			// Smart column positioning - try to maintain relative position
			const newRowLength = this.gridElements[this.currentRow].length;
			if (newRowLength > 0) {
				// Try to maintain the same relative position in the row
				const oldRowLength = this.gridElements[this.currentRow + 1].length;
				const relativePosition = this.currentCol / (oldRowLength - 1 || 1);
				this.currentCol = Math.round(relativePosition * (newRowLength - 1)) || 0;
				this.currentCol = Math.max(0, Math.min(this.currentCol, newRowLength - 1));
			}
			this.updateCurrentIndex();
			console.log(`⬆️ Moved up to row ${this.currentRow}, col ${this.currentCol}`);
			this.focusCurrentElement();
		} else {
			console.log('❌ Already at top row');
		}
	}

	private navigateDown() {
		if (!this.isGridMode || this.gridElements.length === 0) {
			console.log('❌ Cannot navigate down - not in grid mode or no elements');
			return;
		}
		
		if (this.currentRow < this.gridElements.length - 1) {
			this.currentRow++;
			// Smart column positioning - try to maintain relative position
			const newRowLength = this.gridElements[this.currentRow].length;
			if (newRowLength > 0) {
				// Try to maintain the same relative position in the row
				const oldRowLength = this.gridElements[this.currentRow - 1].length;
				const relativePosition = this.currentCol / (oldRowLength - 1 || 1);
				this.currentCol = Math.round(relativePosition * (newRowLength - 1)) || 0;
				this.currentCol = Math.max(0, Math.min(this.currentCol, newRowLength - 1));
			}
			this.updateCurrentIndex();
			console.log(`⬇️ Moved down to row ${this.currentRow}, col ${this.currentCol}`);
			this.focusCurrentElement();
		} else {
			console.log('❌ Already at bottom row');
		}
	}

	private navigateLeft() {
		if (!this.isGridMode || this.gridElements.length === 0) {
			console.log('❌ Cannot navigate left - not in grid mode or no elements');
			return;
		}
		
		if (this.currentCol > 0) {
			this.currentCol--;
			console.log(`⬅️ Moved left to row ${this.currentRow}, col ${this.currentCol}`);
		} else if (this.currentRow > 0) {
			// Wrap to end of previous row
			this.currentRow--;
			this.currentCol = this.gridElements[this.currentRow].length - 1;
			console.log(`⬅️ Wrapped to previous row ${this.currentRow}, col ${this.currentCol}`);
		} else {
			console.log('❌ Already at leftmost position');
			return;
		}
		this.updateCurrentIndex();
		this.focusCurrentElement();
	}

	private navigateRight() {
		if (!this.isGridMode || this.gridElements.length === 0) {
			console.log('❌ Cannot navigate right - not in grid mode or no elements');
			return;
		}
		
		if (this.currentCol < this.gridElements[this.currentRow].length - 1) {
			this.currentCol++;
			console.log(`➡️ Moved right to row ${this.currentRow}, col ${this.currentCol}`);
		} else if (this.currentRow < this.gridElements.length - 1) {
			// Wrap to start of next row
			this.currentRow++;
			this.currentCol = 0;
			console.log(`➡️ Wrapped to next row ${this.currentRow}, col ${this.currentCol}`);
		} else {
			console.log('❌ Already at rightmost position');
			return;
		}
		this.updateCurrentIndex();
		this.focusCurrentElement();
	}

	private updateCurrentIndex() {
		if (!this.isGridMode || this.gridElements.length === 0) return;
		
		// Calculate flat index from row/col position
		let index = 0;
		for (let r = 0; r < this.currentRow; r++) {
			index += this.gridElements[r].length;
		}
		index += this.currentCol;
		this.currentIndex = index;
	}

	private focusCurrentElement() {
		const element = this.focusableElements[this.currentIndex];
		if (element) {
			// Get the movie title for better debugging
			const movieTitle = element.getAttribute('aria-label') || 
							 element.querySelector('h3')?.textContent || 
							 'Unknown movie';
			console.log(`🎯 Focusing: ${movieTitle} (row ${this.currentRow}, col ${this.currentCol})`);
			element.focus();
			
			// Scroll element into view with better positioning
			element.scrollIntoView({ 
				behavior: 'smooth', 
				block: 'center',
				inline: 'center'
			});
		} else {
			console.log(`❌ No element to focus at index ${this.currentIndex}`);
		}
	}

	private activateCurrentElement() {
		const element = this.focusableElements[this.currentIndex];
		if (element) {
			element.click();
		}
	}

	private deactivate() {
		this.isActive = false;
		this.currentIndex = -1;
		this.focusableElements = [];
		
		// Remove focus from current element
		if (document.activeElement instanceof HTMLElement) {
			document.activeElement.blur();
		}
	}

	private updateStore() {
		keyboardStore.set({
			focusedElement: this.focusableElements[this.currentIndex] || null,
			focusableElements: this.focusableElements,
			currentIndex: this.currentIndex,
			gridPosition: this.isGridMode ? { row: this.currentRow, col: this.currentCol } : null,
			gridDimensions: this.isGridMode && this.gridElements.length > 0 ? {
				rows: this.gridElements.length,
				cols: Math.max(...this.gridElements.map(row => row.length))
			} : null
		});
	}

	public destroy() {
		document.removeEventListener('keydown', this.handleKeyDown);
	}
}

// Global keyboard navigation instance
export const keyboardNavigation = new KeyboardNavigationManager();