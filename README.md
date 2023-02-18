# Budget CLI

This little command line tool is the culmination of many years of frustration managing our family's budget. It's main purpose is to import transaction CSVs from our various banks, de-dupe, and categorize them. With a database of transactions, it can provide a YTD report of how much you have spent in what categories and an output of transactions in specific buckets. In the spirit of [Plain Text Accounting](https://plaintextaccounting.org), it uses a local CSV as a database, making it easy to adjust things manually, if needed. 

## Getting Started

This tool is written in TypeScript and targets Node 16 and above but it may work in earlier versions. You will need to have Node and `npm` installed (I recommend [nvm](https://github.com/nvm-sh/nvm#installing-and-updating) for this) before following the steps below.

Clone this repo and install dependencies:

```bash
$ git clone git@github.com:joshcanhelp/budget-cli.git
$ npm ci
```

Build the TS files:

```bash
$ npm run build
```

The script defaults to `./output/data.csv` for it's database so, to test it out, create that file and try to run a report:

```bash
$ mkdir output
$ touch output.csv
```

You should see the following output:

```
🤖 Reading from ./output/data.csv
❌ No transactions found for this date.
```

You are now (probably) ready to go!

## Configuration

This tool can be configured using a `.budget-cli.json` file in the root of this project. This file is ignored by git so you can keep your local configuration and still make contributions, should you be so kind. An exmample file is below:

```json
{
  "outputFile": {
    "YYYY": "/absolute/path/to/data.csv"
  },
  "subCategories": {
    "income": [
      "income_subcategory_1",
      "income_subcategory_2",
      "income_subcategory_3"
    ],
    "expense": [
      "expense_subcategory_1",
      "expense_subcategory_2",
      "expense_subcategory_3"
    ]
  },
  "expenseAllowance": {
    "YYYY": {
      "expense_subcategory_1": {
        "allowance": 300,
        "carryover": 0
      },
      "expense_subcategory_2": {
        "allowance": 300,
        "carryover": 125
      }
    }
  }
}
```

All keys are optional and will provide defaults. 

- `outputFile`: This can be set to a string to use a single file for all transactions or an object with years as keys and paths as values to set a different file for different years. 
- `subCategories`: This can be set to an object with `income` and `expense` as keys. Each of those keys must be set to an array of strings indicating the sub-categories to use for each. When importing transactions, the tool will prompt you to select one. 
- `expenseAllowance`: This can be set to an object with keys indicating a specific year. Each year should be set to an object with expense sub-categories as keys. Each sub-category should be set to an object with the keys `allowance`, indicating how much is allowed per month, and `carryover`, indicating any rollover from the previous year (or `0` if none).

## Importing Transactions

The first thing you will need for this to do anything for you are some transactions in the database. Transactions are imported from CSV files and translated from their original format to the CSV database. The translators currently available are the [translators](src/translators) folder. See the [Contributing](#Contributing) section for how to add or request new translators. 

Assuming we have a CSV from one of the supported banks, we can run the importer, indicating a specific file or a directory containing one or more CSV files. 

```bash
$ npm run import -- --input='/path/to/directory'
# ... or
$ npm run import -- --input='/path/to/directory/transactions.csv'
```

By default, the script will only import transactions for the current year. To import from a year in the past (or, I guess, the future), add a `year` argument to the command.

```bash
$ npm run import -- --input='/path/to/directory' --year='2022'
```

If the command checks out, you will be prompted to confirm the import file. This will help you determine if the configuration file is working. Next, it will prompt you for the first CSV it finds from your import path. Answering `n` will move on to the next CSV found, if there is one. 

If you confirm the import file, it will prompt you for the importer you want to use.

## Contributing

Contributions to this repo are welcome! I recognize that not everyone using this tool will not be able to contribute code so read through the following list for how I can help. 

### I want to add a translator!

That's great, I appreciate it! There are one of two ways to do this:

- If you can write TypeScript, use the [example translator](src/translators/example.ts) to add a new one and follow the [code changes](#i-want-to-make-code-changes) instructions below.
- If you can't (or don't want to) submit code, please [open a new Issue](issues/new) with the following:
    1. The name of the financial institution
    1. An example CSV with at least 5 rows in a `code` block (remove anything sensitive)
    1. Anything else I might need to know about the data and how it's structured

### I found a bug or want a new feature!

Happy to help! Feel free to [open a new Issue](issues/new) with a complete description of what you want to do.

### I want to make code changes!

That's also great, thank you so much! This project is written in TypeScript, checked with ESLint, and formatted with prettier. Bug fixes and small features are fine as a PR with a good description. If you want to do something crazy or foundational, I'd recommend starting with a feature request issue first.

The most common contributions, I expect, will be new translators

Development workflow is to checkout a new branch and start TypeScript in a CLI tab:

```bash
$ git checkout -b feat/new-feature
$ npm run dev
```

Open up a new tab and do your work there. As you develop, TypeScript will tell you what you're doing wrong (that's what it's for). Once things are compiling and you're ready to submit the PR, run formatting:

```bash
$ npm run format
```

Once you're happy with it, push the branch here and open a PR. A GitHub Actions will check the TypeScript builds and that the formatting has been done. Give the PR a nice description and I'll get to it as soon as I can!