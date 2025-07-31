var ce=Object.defineProperty;var de=(n,e,t)=>e in n?ce(n,e,{enumerable:!0,configurable:!0,writable:!0,value:t}):n[e]=t;var b=(n,e,t)=>de(n,typeof e!="symbol"?e+"":e,t);import{_ as he}from"../chunks/D9Z9MdNV.js";import{c as S,p as L,C as Q,b as T,e as d,m as f,u as h,f as u,S as ue,ar as me,as as ge,g as J,G as fe,Q as ve,a8 as A,i as k,j as G,l as V,O as pe,V as be,F as x,o as z,at as we,y as U,aj as xe,t as E,s as C,a as H,q as R,P as K,n as w,U as X,au as Ee,k as Y,av as j,a3 as ye,aw as _e,ag as Ce,ax as Re}from"../chunks/DXSXZ86w.js";import{p as O}from"../chunks/BMzf7GVs.js";import{g as W,a as B,i as Z,b as ee,s as Ae,c as Me}from"../chunks/CjsdXvoT.js";y[x]="src/lib/components/Header.svelte";var Ie=T(z('<header class="fixed top-0 z-50 w-full bg-gradient-to-b from-black/90 to-transparent backdrop-blur-sm transition-all duration-300"><nav class="flex items-center justify-between px-4 py-4 sm:px-6 md:px-12 md:py-6"><div class="flex items-center space-x-4 sm:space-x-6 md:space-x-12"><a href="/" class="text-xl font-black tracking-tight text-red-600 sm:text-2xl md:text-3xl">HighSeas</a> <div class="hidden space-x-4 sm:space-x-6 md:flex md:space-x-8"><a href="/">Home</a> <a href="/movies">Movies</a> <a href="/tv-shows">TV Shows</a></div></div> <div class="flex items-center space-x-3 sm:space-x-4 md:space-x-6"><a href="/search" class="p-2 text-white transition-colors hover:text-gray-300" aria-label="Search content"><!></a> <a href="/settings" class="hidden p-2 text-white transition-colors hover:text-gray-300 sm:block" aria-label="Settings"><!></a> <div class="flex h-7 w-7 cursor-pointer items-center justify-center rounded bg-red-600 transition-colors hover:bg-red-700 sm:h-8 sm:w-8" role="button" tabindex="0" aria-label="User profile"><!></div></div></nav></header>'),y[x],[[6,0,[[9,1,[[10,2,[[11,3],[14,3,[[15,4],[22,4],[29,4]]]]],[39,2,[[40,3],[47,3],[54,3]]]]]]]]);function y(n,e){S(new.target),L(e,!1,y);const[t,s]=pe(),i=()=>(be(O,"page"),ve(O,"$page",t));Q();var a=Ie(),o=d(a),r=d(o),l=f(d(r),2),c=d(l);let v;var p=f(c,2);let M;var D=f(p,2);let m;h(l),h(r);var I=f(r,2),N=d(I),se=d(N);u(()=>ue(se,{class:"h-5 w-5 sm:h-6 sm:w-6"}),"component",y,45,4,{componentTag:"Search"}),h(N);var P=f(N,2),ie=d(P);u(()=>me(ie,{class:"h-5 w-5 sm:h-6 sm:w-6"}),"component",y,52,4,{componentTag:"Settings"}),h(P);var F=f(P,2),re=d(F);u(()=>ge(re,{class:"h-4 w-4 text-white sm:h-5 sm:w-5"}),"component",y,60,4,{componentTag:"User"}),h(F),h(I),h(o),h(a),J((ae,oe,le)=>{v=A(c,1,"font-medium text-white transition-colors hover:text-gray-300",null,v,ae),M=A(p,1,"font-medium text-white transition-colors hover:text-gray-300",null,M,oe),m=A(D,1,"font-medium text-white transition-colors hover:text-gray-300",null,m,le)},[()=>({"text-red-500":fe(i().url.pathname,"/")}),()=>({"text-red-500":i().url.pathname.startsWith("/movies")}),()=>({"text-red-500":i().url.pathname.startsWith("/tv-shows")})]),k(n,a);var ne=G({...V()});return s(),ne}const q=we({focusedElement:null,focusableElements:[],currentIndex:-1,gridPosition:null,gridDimensions:null});class te{constructor(){b(this,"focusableElements",[]);b(this,"currentIndex",-1);b(this,"isActive",!1);b(this,"gridElements",[]);b(this,"currentRow",0);b(this,"currentCol",0);b(this,"isGridMode",!1);this.bindKeyboardEvents()}bindKeyboardEvents(){document.addEventListener("keydown",this.handleKeyDown.bind(this)),document.addEventListener("mousedown",()=>{this.isActive=!1,this.currentIndex=-1,this.updateStore()})}handleKeyDown(e){if(["ArrowUp","ArrowDown","ArrowLeft","ArrowRight","Enter","Escape"].includes(e.key)&&!(e.target instanceof HTMLInputElement||e.target instanceof HTMLTextAreaElement)&&(["ArrowUp","ArrowDown","ArrowLeft","ArrowRight"].includes(e.key)&&(this.isActive||(this.isActive=!0,this.refreshFocusableElements(),this.isGridMode)),!(!this.isActive||this.focusableElements.length===0))){switch(e.preventDefault(),e.key){case"ArrowRight":this.isGridMode?this.navigateRight():this.navigateNext();break;case"ArrowLeft":this.isGridMode?this.navigateLeft():this.navigatePrevious();break;case"ArrowUp":this.isGridMode?this.navigateUp():this.navigatePrevious();break;case"ArrowDown":this.isGridMode?this.navigateDown():this.navigateNext();break;case"Enter":this.activateCurrentElement();break;case"Escape":this.deactivate();break}this.updateStore()}}refreshFocusableElements(){const e=document.querySelectorAll("[data-movie-row]"),t=document.querySelector("[data-search-results]");e.length>0||t?this.setupGridNavigation():this.setupLinearNavigation()}setupGridNavigation(){this.isGridMode=!0,this.gridElements=[];const e=document.querySelectorAll("[data-movie-row]"),t=document.querySelector("[data-search-results]");if(t){const s=Array.from(t.querySelectorAll("[data-movie-card]"));this.createGridFromElements(s)}else{let s=0;e.forEach((i,a)=>{const o=Array.from(i.querySelectorAll("[data-movie-card]"));if(o.length>0){const r=o.filter(l=>this.isElementVisible(l));r.length>0&&(i.querySelector("h2")?.textContent||`${a}`,this.gridElements[s]=r,s++)}})}if(this.gridElements.length>0&&this.gridElements[0]&&this.gridElements[0].length>0)this.currentRow=0,this.currentCol=0,this.gridElements.forEach((s,i)=>{});else{this.isGridMode=!1;return}this.focusableElements=this.gridElements.flat(),this.currentIndex=0}createGridFromElements(e){if(e.length===0)return;const t=e[0].closest("[data-search-results]");if(!t)return;const s=t.getBoundingClientRect().width,i=e[0].getBoundingClientRect().width,a=16,o=Math.floor((s+a)/(i+a));this.gridElements=[];for(let r=0;r<e.length;r+=o){const l=e.slice(r,r+o).filter(c=>this.isElementVisible(c));l.length>0&&this.gridElements.push(l)}}setupLinearNavigation(){this.isGridMode=!1;const e=["button:not([disabled]):not([data-pagination]):not([data-movie-card])",'[role="button"]:not([disabled]):not([data-pagination]):not([data-movie-card])',"a[href]:not([data-pagination]):not([data-movie-card])","input:not([disabled]):not([data-pagination])","select:not([disabled]):not([data-pagination])",'[tabindex]:not([tabindex="-1"]):not([data-pagination]):not([data-movie-card])'];this.focusableElements=Array.from(document.querySelectorAll(e.join(", "))).filter(t=>this.isElementVisible(t)),this.currentIndex===-1&&this.focusableElements.length>0&&(this.currentIndex=0)}isElementVisible(e){const t=e.getBoundingClientRect();return t.width>0&&t.height>0&&t.top<window.innerHeight&&t.bottom>0&&window.getComputedStyle(e).visibility!=="hidden"}navigateNext(){if(this.isGridMode)this.navigateRight();else{if(this.focusableElements.length===0)return;this.currentIndex=(this.currentIndex+1)%this.focusableElements.length,this.focusCurrentElement()}}navigatePrevious(){if(this.isGridMode)this.navigateLeft();else{if(this.focusableElements.length===0)return;this.currentIndex=this.currentIndex<=0?this.focusableElements.length-1:this.currentIndex-1,this.focusCurrentElement()}}navigateUp(){if(!(!this.isGridMode||this.gridElements.length===0)&&this.currentRow>0){this.currentRow--;const e=this.gridElements[this.currentRow].length;if(e>0){const t=this.gridElements[this.currentRow+1].length,s=this.currentCol/(t-1||1);this.currentCol=Math.round(s*(e-1))||0,this.currentCol=Math.max(0,Math.min(this.currentCol,e-1))}this.updateCurrentIndex(),this.focusCurrentElement()}}navigateDown(){if(!(!this.isGridMode||this.gridElements.length===0)&&this.currentRow<this.gridElements.length-1){this.currentRow++;const e=this.gridElements[this.currentRow].length;if(e>0){const t=this.gridElements[this.currentRow-1].length,s=this.currentCol/(t-1||1);this.currentCol=Math.round(s*(e-1))||0,this.currentCol=Math.max(0,Math.min(this.currentCol,e-1))}this.updateCurrentIndex(),this.focusCurrentElement()}}navigateLeft(){if(!(!this.isGridMode||this.gridElements.length===0)){if(this.currentCol>0)this.currentCol--;else if(this.currentRow>0)this.currentRow--,this.currentCol=this.gridElements[this.currentRow].length-1;else return;this.updateCurrentIndex(),this.focusCurrentElement()}}navigateRight(){if(!(!this.isGridMode||this.gridElements.length===0)){if(this.currentCol<this.gridElements[this.currentRow].length-1)this.currentCol++;else if(this.currentRow<this.gridElements.length-1)this.currentRow++,this.currentCol=0;else return;this.updateCurrentIndex(),this.focusCurrentElement()}}updateCurrentIndex(){if(!this.isGridMode||this.gridElements.length===0)return;let e=0;for(let t=0;t<this.currentRow;t++)e+=this.gridElements[t].length;e+=this.currentCol,this.currentIndex=e}focusCurrentElement(){const e=this.focusableElements[this.currentIndex];e&&(e.getAttribute("aria-label")||e.querySelector("h3")?.textContent,e.focus(),e.scrollIntoView({behavior:"smooth",block:"center",inline:"center"}))}activateCurrentElement(){const e=this.focusableElements[this.currentIndex];e&&e.click()}deactivate(){this.isActive=!1,this.currentIndex=-1,this.focusableElements=[],document.activeElement instanceof HTMLElement&&document.activeElement.blur()}updateStore(){q.set({focusedElement:this.focusableElements[this.currentIndex]||null,focusableElements:this.focusableElements,currentIndex:this.currentIndex,gridPosition:this.isGridMode?{row:this.currentRow,col:this.currentCol}:null,gridDimensions:this.isGridMode&&this.gridElements.length>0?{rows:this.gridElements.length,cols:Math.max(...this.gridElements.map(e=>e.length))}:null})}destroy(){document.removeEventListener("keydown",this.handleKeyDown)}}const ke=new te,Se=Object.freeze(Object.defineProperty({__proto__:null,KeyboardNavigationManager:te,keyboardNavigation:ke,keyboardStore:q},Symbol.toStringTag,{value:"Module"}));$[x]="src/lib/components/KeyboardNavigation.svelte";function $(n,e){S(new.target),L(e,!1,$);let t=null;return U(()=>q.subscribe(i=>{t&&t.classList.remove("keyboard-focus"),i.focusedElement&&(i.focusedElement.classList.add("keyboard-focus"),t=i.focusedElement)})),xe(()=>{t&&t.classList.remove("keyboard-focus")}),Q(),G({...V()})}_[x]="src/lib/components/TVLayout.svelte";var Le=T(z(`<style>:global(.tv-layout) {
			/* Ensure content fits in TV safe areas */
			padding: calc(5vh) calc(5vw);
		}

		:global(.tv-layout *:focus) {
			outline: 4px solid #dc2626 !important;
			outline-offset: 4px !important;
			border-radius: 8px;
		}

		:global(.tv-layout .movie-card:focus) {
			transform: scale(1.15) !important;
			z-index: 100 !important;
			box-shadow: 0 25px 50px -12px rgba(220, 38, 38, 0.5) !important;
		}

		:global(.tv-layout .btn) {
			min-height: 60px;
			min-width: 120px;
			font-size: 1.25rem;
			font-weight: 600;
		}

		:global(.tv-layout .btn:focus) {
			transform: scale(1.1);
			background-color: #dc2626 !important;
			color: white !important;
		}

		:global(.tv-layout h1) {
			font-size: 4rem !important;
			line-height: 1.1 !important;
		}

		:global(.tv-layout h2) {
			font-size: 3rem !important;
			line-height: 1.2 !important;
		}

		:global(.tv-layout h3) {
			font-size: 2rem !important;
			line-height: 1.3 !important;
		}

		:global(.tv-layout p) {
			font-size: 1.5rem !important;
			line-height: 1.4 !important;
		}

		/* Larger interactive elements for D-pad navigation */
		:global(.tv-layout button) {
			min-height: 60px;
			padding: 1rem 2rem;
			font-size: 1.25rem;
			border-radius: 12px;
		}

		:global(.tv-layout input) {
			min-height: 60px;
			padding: 1rem;
			font-size: 1.25rem;
			border-radius: 8px;
		}

		/* Movie grid adjustments for TV */
		:global(.tv-layout .movie-grid) {
			gap: 2rem;
		}

		:global(.tv-layout .movie-row) {
			margin-bottom: 3rem;
		}

		/* Enhanced focus transitions */
		:global(.tv-layout *) {
			transition: all 0.2s ease-out;
		}</style>`),_[x],[[58,1]]),Te=T(z("<div><div><!></div></div> <!>",1),_[x],[[50,0,[[51,1]]]]);function _(n,e){S(new.target),L(e,!0,_);let t=E(C(!1),"isAndroidTV"),s=E(C(!1),"useTenFootUI"),i=E(C(H(W())),"fontSizes"),a=E(C(H(B())),"spacing");U(()=>{Z(),R(t,ee(),!0),R(s,Ae(),!0),R(i,W(),!0),R(a,B(),!0)});const o=E(K(()=>()=>{const m="min-h-screen bg-black text-white";return w(s)?`${m} tv-layout overflow-hidden`:`${m} web-layout`}),"containerClasses"),r=E(K(()=>()=>w(s)?"tv-content px-16 py-8":"web-content px-4 py-2 sm:px-6 sm:py-4"),"contentClasses");var l=Te(),c=X(l),v=d(c),p=d(v);u(()=>Ee(p,()=>e.children??_e),"render",_,52,2),h(v),h(c);var M=f(c,2);{var D=m=>{var I=Le();k(m,I)};u(()=>Y(M,m=>{w(s)&&m(D)}),"if",_,56,0)}return J(()=>{A(c,1,j(w(o)),"svelte-qw8h80"),ye(c,"data-platform",w(t)?"tv":"web"),A(v,1,j(w(r)),"svelte-qw8h80")}),k(n,l),G({...V()})}g[x]="src/routes/+layout.svelte";var Ge=T(z("<!> <!> <main><!></main>",1),g[x],[[34,2]]);function g(n,e){S(new.target),L(e,!0,g);let t=E(C(!1),"isAndroidTV");U(()=>{Z(),R(t,ee(),!0),w(t)&&Me(),he(()=>Promise.resolve().then(()=>Se),void 0,import.meta.url)});{const s=Ce(g,function(i){Re(...arguments);var a=Ge(),o=X(a);{var r=p=>{u(()=>y(p,{}),"component",g,31,3,{componentTag:"Header"})};u(()=>Y(o,p=>{w(t)||p(r)}),"if",g,30,2)}var l=f(o,2);u(()=>$(l,{}),"component",g,33,2,{componentTag:"KeyboardNavigation"});var c=f(l,2),v=d(c);u(()=>e.children(v),"render",g,35,3),h(c),k(i,a)});u(()=>_(n,{children:s,$$slots:{default:!0}}),"component",g,28,0,{componentTag:"TVLayout"})}return G({...V()})}export{g as component};
//# sourceMappingURL=0.CWsb16r7.js.map
