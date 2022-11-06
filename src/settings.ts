import { PluginSettingTab, Setting, App} from 'obsidian';
import RenameImagesPlugin from './main'

export interface RenameImagesPluginSettings {
    /*
     Format example: Folder-ChildFolder_Demo file-1.jpg
                           |           |         |
     folderDelimiter ----->+           |         |
     folderFileDelimiter ------------->+         |
     suffixDelimiter --------------------------->+
    */
    useFullFolder: boolean;
    folderDelimiter: string;
    folderFileDelimiter: string;
    suffixDelimiter: string;
	imageNameExample: string;
    showRibbonIcon: boolean;
}

export const DEFAULT_SETTINGS: RenameImagesPluginSettings = {
    useFullFolder: true,
    folderDelimiter: '.',
    folderFileDelimiter: '_',
    suffixDelimiter: '-',
    showRibbonIcon: true,
	imageNameExample: 'Folder-ChildFolder_Demo file-1.jpg',
}

export class RenameImagesPluginSettingTab extends PluginSettingTab {
	plugin: RenameImagesPlugin;

	constructor(app: App, plugin: RenameImagesPlugin) {
		super(app, plugin);
		this.plugin = plugin;
	}

	display(): void {
		const {containerEl} = this;

		containerEl.empty();

		containerEl.createEl('h2', {text: 'Rename images - Settings'});

        // Show Ribbon Icon
        new Setting(containerEl)
            .setName('Show Ribbon Icon')
            .setDesc('Turn on if you want Ribbon Icon for renaming all images')
            .addToggle((toggle) =>
                toggle.setValue(this.plugin.settings.showRibbonIcon).onChange((value) => {
                    this.plugin.settings.showRibbonIcon = value;
                    this.plugin.saveSettings();
                    this.plugin.refreshIconRibbon();
                })
            );		
		
        // Preview button
        new Setting(containerEl)
            .setName('Preview example image filename format')
            .setDesc('Adjust settings below, then click Preview button')
            .addButton((button) => {
                button.setButtonText('Preview');
                button.onClick(() => {
                    this.noticeExamplePreview();
                });
            })
            

		// Use full folder path as prefix
		new Setting(containerEl)
			.setName('Use full folder path as prefix')
			.addToggle((toggle) => 
                toggle.setValue(this.plugin.settings.useFullFolder).onChange(async (value) => {
					this.plugin.settings.useFullFolder = value;
					await this.plugin.saveSettings()
                    this.display();
				})
			);

        
        if (this.plugin.settings.useFullFolder) {
            // Choose delimiter between folder and its child folder
            new Setting(containerEl)
                .setName('Delimiter between folder and its child folder or file')
                .addDropdown((dropdown) => {
                    dropdown.addOption('.', '.');
                    dropdown.addOption('', 'Use no delimiter');
                    dropdown.addOption(' ', 'Use space');
                    dropdown.addOption('-', '-');
                    dropdown.addOption('_', '_');
                    dropdown.setValue(this.plugin.settings.folderDelimiter);
                    dropdown.onChange((option) => {
                        this.plugin.settings.folderDelimiter = option;
                        this.plugin.saveSettings();
                    });
                });   
        }

        // Choose delimiter between file and folder
        new Setting(containerEl)
        .setName('Delimiter between file and folder')
        .addDropdown((dropdown) => {
            dropdown.addOption('.', '.');
            dropdown.addOption('', 'Use no delimiter');
            dropdown.addOption(' ', 'Use space');
            dropdown.addOption('-', '-');
            dropdown.addOption('_', '_');
            dropdown.setValue(this.plugin.settings.folderFileDelimiter);
            dropdown.onChange((option) => {
                this.plugin.settings.folderFileDelimiter = option;
                this.plugin.saveSettings();
            });
        });
		
        
		// Choose delimiter between filename and number
		new Setting(containerEl)
		    .setName('Delimiter between filename and number')
            .addDropdown((dropdown) => {
                dropdown.addOption('', 'Use no delimiter');
                dropdown.addOption(' ', 'Use space');
                dropdown.addOption('-', '-');
                dropdown.addOption('_', '_');
                dropdown.setValue(this.plugin.settings.suffixDelimiter);
                dropdown.onChange((option) =>{
                    this.plugin.settings.suffixDelimiter = option;
                    this.plugin.saveSettings();
                });
            });
	}

    noticeExamplePreview = () => {
		// TODO 实现 notice example format preview
		
	}
}