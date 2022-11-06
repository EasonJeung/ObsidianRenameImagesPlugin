import { MarkdownView, Notice, Plugin, TFile } from 'obsidian';
import { RenameImagesPluginSettings, DEFAULT_SETTINGS, RenameImagesPluginSettingTab } from './settings';
import {path, getVaultConfig} from './utils'

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

	renameAllImages = () => {

		const activeFile = this.app.workspace.getActiveFile();
		if (!activeFile.path.endsWith('.md')) return;

		const metadataCache = this.app.metadataCache;
		const fileCache = metadataCache.getFileCache(activeFile);
		if (!fileCache || !fileCache.embeds) return;

		const extPatternRegex = /jpe?g|png|gif|tiff|webp/i;

		new Notice('RenameImagesPlugin is renaming images.')

		// BUG: 在已经命名过的文件里，最前面插入一张新的图片，再次重命名时会有名称冲突
		// BUG: Insert a new image at the top of a file whose images have already been batch named, and there will be a name conflict when batch renaming again.
		let embedIndex: number = 1;
		for (const embed of fileCache.embeds) {

			const file = metadataCache.getFirstLinkpathDest(embed.link, activeFile.path)
			if (!file) {
				console.log('RenameImagesPlugin warning: image file not found', embed.link);
				return;
			}

			// check filename extension
			const isMatched = extPatternRegex.exec(file.extension)
			if (!isMatched) continue;

			// rename
			const newNameStem = this.generateNewNameStem(activeFile.path, embedIndex);
			this.renameFile(file, newNameStem, true)

			embedIndex++;			
		}

		new Notice('RenameImagesPlugin finished renaming process.')
	}

	generateNewNameStem(activeFilePath: string, sufNum: number) {

		const {useFullFolder, 
			folderDelimiter, 
			folderFileDelimiter, 
			suffixDelimiter
		} = this.settings;

		let pathParts: string[] = [];
		pathParts = path.split(activeFilePath);

		let newName: string = '';

		const len = pathParts.length;
		if (len == 1) {
			// example: [orphan demo file] ==> orphan demo file-1
			newName = pathParts[0].concat(suffixDelimiter, String(sufNum));
		} else if (len == 2) {
			// example: [folder, demo file] ==> folder_demo file-1
			newName = pathParts[0].concat(folderFileDelimiter, pathParts[1],
				suffixDelimiter, String(sufNum));
		} else if (!useFullFolder) {
			// example: [Year, Month, Week, day demo file]
			// ==> Week_day demo file-1
			newName = pathParts[len-2].concat(folderFileDelimiter, pathParts[len-1],
				suffixDelimiter, String(sufNum));
		} else {
			// example: [Year, Month, Week, day demo file]
			// ==> Year-Month-Week_day demo file-1
			for (let i = 0; i < len - 2; i++) {
				newName = newName.concat(pathParts[i], folderDelimiter);
			}
			newName = newName.concat(pathParts[len-2], folderFileDelimiter, 
				pathParts[len-1], suffixDelimiter, String(sufNum))
		}
		return newName;
	}

	renameFile(file: TFile, newNameStem: string, manualUpdateInternLink: boolean) {

		const originName = file.name;
		const originStem = file.basename
		const ext = file.extension
		const newNameWithExt = newNameStem.concat('.', ext);

		if (newNameWithExt == originName) {
			return;
		}

		// file system operation
		const newPath = file.parent.path.concat('/', newNameWithExt);
		try {
			this.app.fileManager.renameFile(file, newPath);
		} catch (err) {
			new Notice(`Failed to rename ${originName} to ${newNameWithExt}: ${err}`);
			throw err;
		}

		if (!manualUpdateInternLink) {
			return
		}
		/*
		 * In case fileManager.renameFile may not update the internal link in the active file,
		 * we manually replace the current line by manipulating the editor
		*/

		// Get vault config, determine whether useMarkdownLinks is set
		const vaultConfig = getVaultConfig(this.app);
		let useMarkdownLinks = false;
		if (vaultConfig && vaultConfig.useMarkdownLinks) {
			useMarkdownLinks = true;
		}

		let linkTextRegex, newLinkText
		if (useMarkdownLinks) {
			// NOTE should use this.app.fileManager.generateMarkdownLink(file, sourcePath) to get the encoded newNameStem, right now we just ignore this problem
			linkTextRegex = new RegExp('!\\[\\]\\(([^[\\]]*\\/)?${originStem}\\.${ext}\\)')
			newLinkText = `![]($1${newNameStem}.${ext}])`
		} else {
			// ![[xxxx.png]] -> ![[attachments/xxxx.png]]
			linkTextRegex = new RegExp(`!\\[\\[([^[\\]]*\\/)?${originStem}\\.${ext}\\]\\]`)
			newLinkText = `![[$1${newNameStem}.${ext}]]`
		}


		const editor = this.getActiveEditor()
		if (!editor) {
			new Notice(`Failed to rename ${newNameWithExt}: no active editor`)
			return
		}

		const cursor = editor.getCursor()
		const line = editor.getLine(cursor.line)
		const replacedLine = line.replace(linkTextRegex, newLinkText)
		editor.transaction({
			changes: [
				{
					from: {...cursor, ch: 0},
					to: {...cursor, ch: line.length},
					text: replacedLine,
				}
			]
		})
	}

	getActiveEditor() {
		const view = this.app.workspace.getActiveViewOfType(MarkdownView)
		return view?.editor
	}
	
}


