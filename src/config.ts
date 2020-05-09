import fs from "fs";
import nativePath from "path";
import Path from "./path";
import {FilesystemSignal, TSignalType, TOptAsync, TOpt} from "./helpers";

export type TConfig = {
    readonly name: string;

    readonly initializedTimestamp: number;
};

export default abstract class Config {
    /**
     * The name of the configuration file.
     */
    public static readonly fileName: string = ".shark";

    public static initSync(path: Path): TSignalType {
        if (path.exists) {
            return FilesystemSignal.PathExists;
        }

        const configFilePath: string = nativePath.join(path.toString(), Config.fileName);

        fs.writeFileSync(configFilePath, JSON.stringify({
            name: path.toNativePath().name,
            initializedTimestamp: Date.now()
        }));

        return fs.existsSync(configFilePath);
    }

    public static loadConfigSync(path: Path): TOpt<TConfig> {
        /**
         * Provided Configuration file path does not exist,
         * return immediately.
         */
        if (!path.exists) {
            return undefined;
        }

        const configContent: string = fs.readFileSync(path.toString()).toString();

        try {
            return JSON.parse(configContent);
        }
        catch (error) {
            return undefined;
        }
    }
}
