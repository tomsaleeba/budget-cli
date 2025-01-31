import { readFileSync, writeFileSync } from "fs";
import { stringify, parse as csvParse } from "csv/sync";

import {
  TransactionComplete,
  TransactionHeader,
  transactionHeaders,
} from "./transaction.js";

export type TransactionTransform = (transaction: string[]) => string[];

export class DB {
  private store: string[][] = [];
  private outputFile: string;
  private tids: {
    [key: string]: string[];
  } = {};

  constructor(outputFile: string) {
    this.outputFile = outputFile;
  }

  ////
  /// Public
  //

  public loadTransactions = (): void => {
    const data = readFileSync(this.outputFile, { encoding: "utf8" });
    this.store = csvParse(data, {
      skip_empty_lines: true,
      from_line: 2,
    }) as string[][];
    this.loadTransactionIds();
  };

  public saveRow = (row: TransactionComplete): void => {
    const pushRow: string[] = [];
    transactionHeaders.forEach((header: TransactionHeader) => {
      pushRow.push(`${row[header.key] || ""}`);
    });
    this.store.push(pushRow);
    this.save();
    this.addTransactionId(pushRow);
  };

  public hasTransaction = (account: string, id: string): boolean => {
    return !!this.tids[account] && this.tids[account].includes(id);
  };

  public getByDate = (dateRequested: string): string[][] => {
    const searchRegex = new RegExp(`^${dateRequested}`, "g");
    return this.store.filter((transaction: string[]) => {
      return !!(transaction[2].match(searchRegex) || []).length;
    });
  };

  public getByTerms = (category: string, subCategory: string): string[][] => {
    return this.store.filter((transaction: string[]) => {
      const isCategoryMatch = category === transaction[9] || category === "*";
      const isSubCategoryMatch =
        subCategory === transaction[10] || subCategory === "*";
      return isCategoryMatch && isSubCategoryMatch;
    });
  };

  public bulkEdit = (transform: TransactionTransform): void => {
    const newStore = this.store.map(transform);
    this.store = newStore;
    this.save();
  };

  ////
  /// Private
  //

  private save = (): void => {
    const csvHeaders = transactionHeaders.map(
      (header: TransactionHeader) => header.header
    );
    writeFileSync(
      this.outputFile,
      stringify(this.store, { columns: csvHeaders, header: true })
    );
  };

  private loadTransactionIds = (): void => {
    this.store.forEach((transaction: string[]) => {
      this.addTransactionId(transaction);
    });
  };

  private addTransactionId = (transaction: string[]): void => {
    const [id, account] = transaction;
    if (!this.tids[account]) {
      this.tids[account] = [];
    }
    if (!this.tids[account].includes(id)) {
      this.tids[account].push(id);
    }
  };
}
