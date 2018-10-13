import {Component, NgModule, OnInit} from '@angular/core';
import {
  MatButtonModule,
  MatCardModule,
  MatFormFieldModule,
  MatIconModule,
  MatInputModule,
  MatPaginatorModule,
  MatProgressBarModule,
  MatTableModule
} from '@angular/material';
import {FlexLayoutModule} from '@angular/flex-layout';
import {InvestmentSummary} from '../core/models/investment-summary.model';
import {InvestmentPeriodService} from '../core/services/investment-period.service';
import {CoreModule} from '../core/core.module';

@Component({
  selector: 'app-root',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {

  investmentSummary = [];

  isLoadingDashboards = false;

  constructor(
    private investmentPeriodService: InvestmentPeriodService
  ) { }

  ngOnInit() {
    this.loadDashboards();
  }

  private loadDashboards() {
    this.isLoadingDashboards = true;

    this.investmentPeriodService.summary()
      .subscribe(data => {
        this.investmentSummary = this.convertInvestmentSummaryToArray(data);
        this.isLoadingDashboards = false;
      }, err => {
        this.isLoadingDashboards = false;
      });
  }

  private convertInvestmentSummaryToArray(investmentSummary: InvestmentSummary) {
    const dataTemplate = {
      fund: {title: 'Tổng tiền vốn', value: 0, isBold: false, desc: 'Tiền vốn đã chuyển vào sàn'},
      fees: {title: 'Tổng phí dịch vụ', value: 0, isBold: false, desc: 'Tổng tiền phí giao dịch mua và bán'},
      buyMoney: {title: 'Tổng tiền mua', value: 0, isBold: false, desc: 'Tiền đã mua cổ phiếu'},
      sellMoney: {title: 'Tổng tiền bán', value: 0, isBold: false, desc: 'Tiền đã bán cổ phiếu'},
      moneyAsStock: {title: 'Tiền vốn bằng cổ phiếu', isBold: false, value: 0, desc: 'Tiền vốn dưới dạng cổ phiếu'},
      netRevenue: {title: 'Lợi nhuận ròng', value: 0, isBold: true, desc: 'Lợi nhuận khối lượng cổ phiếu đã bán - phí dịch vụ'},
      availableMoney: {title: 'Tiền rỗi', value: 0, isBold: true, desc: 'Tiền đang có trên sàn để mua cổ phiếu'},
      expectedMoney: {title: 'Tổng tài sản', value: 0, isBold: true, desc: 'Tổng tiền gồm lợi nhuận ròng + tổng tiền vốn'},
    };

    Object.keys(investmentSummary).forEach(function (key) {
      dataTemplate[key].value = investmentSummary[key];
    });

    const data = [];

    for (const item in dataTemplate) {
      data.push(dataTemplate[item]);
    }

    return data;
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
  exports: [DashboardComponent],
  declarations: [DashboardComponent],
})
export class DashboardModule {
}
