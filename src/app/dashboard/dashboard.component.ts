import {Component, NgModule, OnInit} from '@angular/core';
import {
  MatButtonModule,
  MatCardModule,
  MatDividerModule,
  MatFormFieldModule,
  MatIconModule,
  MatInputModule,
  MatPaginatorModule,
  MatProgressBarModule,
  MatTableModule
} from '@angular/material';
import {FlexLayoutModule} from '@angular/flex-layout';
import {InvestmentSummary} from '../core/models/investment-summary.model';
import {CoreModule} from '../core/core.module';
import {DxPieChartModule} from 'devextreme-angular';
import {DashboardService} from '../core/services/dashboard.service';
import {DashboardData} from '../core/models/dashboard-data.model';

@Component({
  selector: 'app-root',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {

  dashboardData: DashboardData = new DashboardData();
  investmentSummary = [];

  isLoadingDashboards = false;

  constructor(
    private dashboardService: DashboardService
  ) { }

  ngOnInit() {
    this.loadDashboards();
  }

  private loadDashboards() {
    this.isLoadingDashboards = true;

    this.dashboardService.data()
      .subscribe(data => {
        this.dashboardData = data;
        this.investmentSummary = this.convertInvestmentSummaryToArray(data.summary);
        this.isLoadingDashboards = false;
      }, err => {
        this.isLoadingDashboards = false;
      });
  }

  private convertInvestmentSummaryToArray(investmentSummary: InvestmentSummary) {
    const dataTemplate = {
      fund: {title: 'Tổng tiền vốn', value: 0, isBold: false, desc: 'Tiền vốn đã chuyển vào sàn'},
      fees: {title: 'Tổng phí giao dịch', value: 0, isBold: false, desc: 'Tổng tiền phí giao dịch mua và bán'},
      buyMoney: {title: 'Tổng tiền mua', value: 0, isBold: false, desc: 'Tiền đã mua cổ phiếu'},
      sellMoney: {title: 'Tổng tiền bán', value: 0, isBold: false, desc: 'Tiền đã bán cổ phiếu'},
      capitalOfHoldStock: {title: 'Tiền vốn cổ phiếu đang giữ', isBold: false, value: 0, desc: 'Tổng tiền vốn của KL cổ phiếu đang giữ'},
      valueOfHoldStock: {title: 'Giá trị cổ phiếu đang giữ', value: 0, isBold: false, desc: 'Tổng giá trị của KL cổ phiếu đang giữ ở thời điểm hiện tại'},
      netRevenue: {title: 'Lợi nhuận ròng', value: 0, isBold: true, desc: 'Lợi nhuận khối lượng cổ phiếu đã bán - phí dịch vụ'},
      grossRevenue: {title: 'Lợi nhuận gộp', value: 0, isBold: true, desc: 'Lợi nhuận tính bằng tiền bán - tiền mua - phí giao dịch'},
      availableMoney: {title: 'Sức mua', value: 0, isBold: true, desc: 'Tiền đang có trên sàn để mua cổ phiếu'},
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

  customizeLabel(arg) {
    return `${arg.argumentText} (${arg.percentText})`;
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
    MatDividerModule,
    DxPieChartModule,
    FlexLayoutModule
  ],
  exports: [DashboardComponent],
  declarations: [DashboardComponent],
})
export class DashboardModule {
}
