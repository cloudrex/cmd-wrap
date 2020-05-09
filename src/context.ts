import fs from "fs";
import nativePath from "path";
import process from "process";
import os, {UserInfo} from "os";
import chalk from "chalk";
import Path from "./path";
import PathShortner from "./pathShortner";
import Config, {TConfig} from "./config";
import {TOpt} from "./helpers";

export default class Context {
    public static readonly userInfo: UserInfo<string> = os.userInfo();

    public static activeComponent?: TConfig;

    /**
     * Attempt to change the current active directory.
     * Will return false if the path does not exist,
     * or are otherwise unable to access it.
     */
    public static navigate(path: Path): boolean {
        // Ensure path actually exists before continuing.
        if (path.exists) {
            const pathString: string = path.toString();

            process.chdir(pathString);

            /**
             * To ensure we've changed the working directory, compare
             * the actual current directory to our inteded target
             * directory.
             */
            const success: boolean = process.cwd() == pathString;

            // TODO: Should be handled by an event router of some form.
            const configFilePath: Path = new Path(nativePath.join(pathString, Config.fileName));

            // TODO: Not working.
            if (success && configFilePath.exists) {
                const config: TOpt<TConfig> = Config.loadConfigSync(configFilePath);

                /**
                 * Component configuration was successfully loaded. Update
                 * the active component.
                 */
                if (config !== undefined) {
                    Context.activeComponent = config;
                }
            }

            return success;
        }

        // Path does not exist, process should fail immediately.
        return false;
    }

    public static getWorkingDirectory(): Path {
        return new Path(process.cwd());
    }

    public static getPrompt(): string {
        let workingDirectoryString: string = chalk.gray(PathShortner.shortenCommonEntities(Context.getWorkingDirectory()).toString());

        if (Context.activeComponent !== undefined) {
            workingDirectoryString = chalk.green(`[${Context.activeComponent!.name}]`);
        }

        // TODO: Need to resolve whether the user is an admin or not.
        const separationSymbol: string = false ? "$" : ">";

        return ` ${workingDirectoryString} ${chalk.blueBright(Context.userInfo.username)} ${separationSymbol} `;
    }
}
