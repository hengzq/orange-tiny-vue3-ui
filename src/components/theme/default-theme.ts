const DefaultTheme = {
  id: 'tiny-default-theme',
  name: 'DefaultTheme',
  data: {
    'o-border-line-1': '#e9edf0'
  },
  css: `
        .tiny-grid__wrapper {
            --tv-Grid-cell-padding-y: 5px;
            --tv-Grid-cell-padding-x: 5px;
        }
        .tiny-tree-menu {
            --tv-TreeMenu-node-height: 45px;
        }
        .tiny-drawer {
        }
        .tiny-dialog-box__wrapper {
            --tv-DialogBox-padding: 20px;
        }
    `
};

export {
  DefaultTheme
}
