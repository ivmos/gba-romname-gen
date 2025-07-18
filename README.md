# GBA ROM Name Generator

A command-line tool to scan a directory of Game Boy Advance (`.gba`) ROM files and generate a `romname.lst` file, commonly used by flashcarts like the EZ-Flash IV.

This is a modernized version of the original tool, updated to use modern JavaScript features for better performance and maintainability.

## Features

- Recursively scans a directory for `.gba` files.
- Extracts the internal game title and game code from the ROM header.
- Cleans up the filename to create a readable title.
- Outputs a list in the format `GameTitleGameCode|GameCode|CleanedTitle`.
- Fully asynchronous, non-blocking I/O for faster processing.
- Zero dependencies.

## Prerequisites

- [Node.js](https://nodejs.org/) version 18.0.0 or higher.

## Installation

1.  Clone this repository:
    ```sh
    git clone https://github.com/jhermsmeier/gba-romname-gen.git
    ```
2.  Navigate into the project directory:
    ```sh
    cd gba-romname-gen
    ```
3.  (Optional) Install development dependencies if you plan to contribute:
    ```sh
    npm install
    ```

## Usage

Run the script by pointing it to the directory containing your `.gba` ROM files. The output will be printed to the standard output, which you can redirect to a file.

```sh
node gba-romname-gen.js /path/to/your/gba/roms > romname.lst
```

**Example:**

If you have a directory `~/roms/gba/`, you would run:

```sh
node gba-romname-gen.js ~/roms/gba > romname.lst
```

This will create a `romname.lst` file in the current directory with the generated list.

## License

This project is licensed under the MIT License - see the [LICENSE.md](LICENSE.md) file for details.
