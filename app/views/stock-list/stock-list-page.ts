import { EventData, Page } from '@nativescript/core';
import { StockListViewModel } from './stock-list-view-model';

export function navigatingTo(args: EventData) {
    const page = <Page>args.object;
    page.bindingContext = new StockListViewModel();
}