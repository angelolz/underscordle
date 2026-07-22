<div align="center">
    <img src="src/lib/assets/favicon-128x128.png" alt="underscordle logo" style="vertical-align: middle; margin-right: 15px;" />
    <img src="src/lib/assets/underscordle.svg" alt="underscordle title" style="vertical-align: middle;" />
</div>

<div align="center"><i>A daily underscores song guessing game featuring five songs and three guesses per track.</i></div>

## Tech Stack

- **Frontend**: [Svelte 5](https://svelte.dev/) & [SvelteKit](https://svelte.dev/docs/kit/introduction) (using the Cloudflare adapter)
- **Styling**: [TailwindCSS v4](https://tailwindcss.com/) (using Vite plugin integration)
- **Database**: [Cloudflare D1](https://developers.cloudflare.com/d1/) (SQLite-based serverless database)
- **ORM & Migrations**: [Drizzle ORM](https://orm.drizzle.team/)
- **Deployment & Emulation**: [Wrangler](https://developers.cloudflare.com/workers/wrangler/) (Cloudflare CLI)
- **Audio Processing**: [fluent-ffmpeg](https://github.com/fluent-ffmpeg/node-fluent-ffmpeg) (used by ingestion scripts to crop tracks)

## Project Structure

- `src/routes/`: Svelte pages and API endpoints
- `src/lib/components/`: ui components (e.g. gameplay, stats, keyboard, layouts).
- `src/lib/server/db/`: db schemas (not a lot here lol)
- `scripts/`: scripts for processing audio, extracting album covers from songs, metadata manifests, and slicing daily guesses.
- `drizzle/`: Auto-generated SQL migration files.

## Local Development Setup

Before you start, make sure you have the following installed on your machine:

1. **Node.js** (v20+ recommended, check `.nvmrc`)
2. **pnpm** (preferred package manager, check `package.json`'s `packageManager` field)
3. **FFmpeg** (Required for the daily audio snippet generation scripts):
    - **macOS**: `brew install ffmpeg`
    - **Windows**: Install via `winget install Gyan.FFmpeg` or download from [ffmpeg.org](https://ffmpeg.org/) and add it to your System PATH.
    - **Linux**: `sudo apt install ffmpeg`

### Clone the repository & install dependencies

```bash
git clone https://github.com/angelolz/underscordle
cd underscordle
pnpm install # or npm install if you don't use pnpm (which you should tbh)
```

### Set up the local database

Initialize the local SQLite (D1 emulation) database and apply existing migrations:

```bash
pnpm db:migrate:local
```

_(This writes the D1 SQLite file to `.wrangler/state/v3/d1` and runs the migrations locally)._

If you make modifications to the database schema (`src/lib/server/db/schema.ts`), generate a new migration using:

```bash
pnpm db:generate
```

### Prepare Assets

1. Create a `masters/` directory in the root and drop some audio files (`.mp3`, `.wav`, or `.flac`) into it.
    - **IMPORTANT**: please make sure all your songs are properly tagged (with artwork as well)! underscordle reads the metadata tags of your audio files to properly extract song info and artwork!
2. Convert and prepare them. Run each of these commands in this order:

    ```bash
    pnpm convert      # converts raw files to normalized .m4a format in out/masters
                      # you can skip this step if your files are mp3's.

    pnpm bootstrap    # registers raw tracks into a local registry configuration
                      # YOU ONLY NEED TO RUN THIS COMMAND ONCE.

    pnpm scan         # extracts metadata & album covers to out/data/ and out/covers/
                      # use this command every time you add new songs to the list

    pnpm generate     # generates daily challenge snippets in out/dailies/
                      # you can generate a challenge for a specific date using pnpm generate [YYYY-MM-DD]
    ```

3. Link the generated local media files to SvelteKit's static directory so they can be served locally:
    - **Windows (PowerShell)**:
        ```powershell
        .\scripts\link-assets.ps1
        ```
    - **macOS/Linux**:
        ```bash
        chmod +x ./scripts/link-assets.sh
        ./scripts/link-assets.sh
        ```

### Run the Development Server

- **Note: Before running the development server, change the `START_DATE_STRING` inside `src/lib/statics.ts` to today's date, or the earliest generated challenge date.**
- **Vite Development Server** (Fastest frontend reload, database emulated):
    ```bash
    pnpm dev
    ```

## Quality and Linting Standards

To maintain code formatting and quality:

- Run linting command: `pnpm lint`
- Keep all type definitions in `src/app.d.ts` or corresponding `$lib/interfaces.ts`.

## License

GPL-3.0 license
