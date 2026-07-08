chrome.runtime.onInstalled.addListener(()=>{chrome.sidePanel?.setPanelBehavior({openPanelOnActionClick:!1}).catch(()=>{})});chrome.action.onClicked.addListener(async e=>{e.windowId!=null&&await chrome.sidePanel?.open({windowId:e.windowId})});chrome.runtime.onMessage.addListener((e,d,n)=>(n({ok:!0}),!0));
//# sourceMappingURL=index.ts-Dob2Sbly.js.map
