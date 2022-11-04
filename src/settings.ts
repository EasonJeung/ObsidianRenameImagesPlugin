import { PluginSettingTab, Setting, App, Notice } from 'obsidian';
import RenameImagesPlugin from './main'

export interface RenameImagesPluginSettings {
    useFolder: boolean;
    folderDelimiter: string;
    suffixDelimiter: string;
	imageNameExample: string;
    showRibbonIcon: boolean;
}

export const DEFAULT_SETTINGS: RenameImagesPluginSettings = {
    useFolder: true,
    folderDelimiter: '.',
    suffixDelimiter: '-',
    showRibbonIcon: true,
	imageNameExample: 'Folder#ChildFolder#Demo file-1.jpg',
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
		
		// Use folder path as prefix
		new Setting(containerEl)
			.setName('Use folder path as prefix')
			.setDesc('Disable this, image name woulde be like \'filename-1.jpg\'. So if all your files have images in a dedicated folder, for example, Attachment folder, images of files with the same name in different folders may conflict.')
			.addToggle((toggle) => 
                toggle.setValue(this.plugin.settings.useFolder).onChange(async (value) => {
					this.plugin.settings.useFolder = value;
					await this.plugin.saveSettings()
                    this.display();
				})
			);

        
        if (this.plugin.settings.useFolder) {
            // Choose delimiter between folder and its child folder
            new Setting(containerEl)
                .setName('Delimiter between folder and its child folder or file')
                .setDesc('Select which delimiter you prefer')
                .addDropdown((dropdown) => {
                    dropdown.addOption('.', '.');
                    dropdown.addOption('', 'Use no delimiter');
                    dropdown.addOption(' ', 'Use space');
                    dropdown.addOption('-', '-');
                    dropdown.addOption('_', '_');
                    dropdown.addOption('#', '#');
                    dropdown.setValue(this.plugin.settings.folderDelimiter);
                    dropdown.onChange((option) => {
                        this.plugin.settings.folderDelimiter = option;
                        this.plugin.saveSettings();
                    });
                });   
        }
		
        
		// Choose delimiter between filename and number
		new Setting(containerEl)
		    .setName('Delimiter between filename and number')
            .setDesc('Select which delimiter you prefer')
            .addDropdown((dropdown) => {
                dropdown.addOption('', 'Use no delimiter');
                dropdown.addOption(' ', 'Use space');
                dropdown.addOption('-', '-');
                dropdown.addOption('_', '_');
                dropdown.addOption('#', '#');
                dropdown.setValue(this.plugin.settings.suffixDelimiter);
                dropdown.onChange((option) =>{
                    this.plugin.settings.suffixDelimiter = option;
                    this.plugin.saveSettings();
                });
            });
	}
}