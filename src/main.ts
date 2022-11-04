import { Notice, Plugin } from 'obsidian';
import {RenameImagesPluginSettings, DEFAULT_SETTINGS, RenameImagesPluginSettingTab} from './settings';

export default class RenameImagesPlugin extends Plugin {
	settings: RenameImagesPluginSettings;
	ribbonIconEl: HTMLElement | undefined = undefined;

	async onload() {
		await this.loadSettings();

		this.refreshIconRibbon();

		this.addCommand({
			id: 'rename-all-images',
			name: 'Rename all images of current file',
			callback: () => {
				this.renameAllImages();
			}
		});

		// Add a setting tab of the plugin
		this.addSettingTab(new RenameImagesPluginSettingTab(this.app, this));
	}

	onunload() {

	}

	async loadSettings() {
		this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
	}

	async saveSettings() {
		await this.saveData(this.settings);
	}


	refreshIconRibbon = () => {
		this.ribbonIconEl?.remove();
        if (this.settings.showRibbonIcon) {
            this.ribbonIconEl = this.addRibbonIcon('image-file', 'Rename all images of current file', (event): void => {
                this.renameAllImages();
            });
        }
	}

	// ? 是否该用 async
	renameAllImages = async () => {
		// TODO 实现 rename all images
		new Notice(`${this.settings.imageNameExample}`);
	}
}


