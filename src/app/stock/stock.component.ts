import {Component, NgModule, OnInit, ViewChild} from '@angular/core';
import {
  MatButtonModule,
  MatCardModule,
  MatFormFieldModule,
  MatIconModule,
  MatInputModule,
  MatPaginator,
  MatPaginatorModule,
  MatProgressBarModule,
  MatTableModule
} from '@angular/material';
import {FlexLayoutModule} from '@angular/flex-layout';
import {PageResponse} from '../core/models/page-response.model';
import {InvestmentPeriod} from '../core/models/investment-period.model';
import {InvestmentPeriodService} from '../core/services/investment-period.service';
import {CoreModule} from '../core/core.module';

@Component({
  selector: 'app-root',
  templateUrl: './stock.component.html',
  styleUrls: ['./stock.component.css']
})
export class StockComponent implements OnInit {

  aggregates: PageResponse<InvestmentPeriod> = new PageResponse<InvestmentPeriod>();

  aggregatePageSize = 30;
  isLoadingAggregates = false;

  @ViewChild('aggregatesPaginator') aggregatesPaginator: MatPaginator;

  constructor(
    public investmentPeriodService: InvestmentPeriodService
  ) { }

  ngOnInit() {
    this.loadAggregates(0);

    this.subscribeEvents();
  }

  private subscribeEvents() {
    this.aggregatesPaginator.page.subscribe(event => {
      this.loadAggregates(this.aggregatesPaginator.pageIndex);
    });
  }

  private loadAggregates(page: number) {
    this.isLoadingAggregates = true;

    this.investmentPeriodService.aggregates(page, this.aggregatePageSize)
      .subscribe(data => {
        this.aggregates = data;
        this.isLoadingAggregates = false;
      }, err => {
        this.isLoadingAggregates = false;
      });
  }


  calcDisplayedColumns() {
    return ['stock', 'buyQuantity', 'buyAvgPrice', 'buyFee', 'buyMoney',
      'sellQuantity', 'sellAvgPrice', 'sellFee', 'sellTax', 'sellMoney',
      'holdQuantity', 'latestPrice', 'holdMoney', 'netRevenue', 'grossRevenue', 'roiPercentage',
      'startedOn', 'endedOn', 'totalPeriod'];
  }

  calcDisplayedSubHeaderColumns() {
    return ['buyQuantity', 'buyAvgPrice', 'buyFee', 'buyMoney',
      'sellQuantity', 'sellAvgPrice', 'sellFee', 'sellTax', 'sellMoney',
      'holdQuantity', 'latestPrice', 'holdMoney', 'netRevenue', 'grossRevenue', 'roiPercentage',
      'startedOn', 'endedOn', 'totalPeriod'];
  }

  calcDisplayedHeaderColumns() {
    return ['stock', 'buyColumns', 'sellColumns', 'holdColumns', 'revenueColumns', 'tradingTimeColumns'];
  }
}


@NgModule({
  imports: [
    CoreModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatCardModule,
    MatIconModule,
    MatTableModule,
    MatPaginatorModule,
    MatProgressBarModule,
    FlexLayoutModule
  ],
  exports: [StockComponent],
  declarations: [
    StockComponent
  ],
})
export class StockModule {
}
