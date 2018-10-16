import {InvestmentSummary} from './investment-summary.model';
import {ChartData} from './chart-data.model';

export class DashboardData {
  summary: InvestmentSummary;
  holdingByCapitalStockChartData: ChartData[];
  holdingByMarketPriceStockChartData: ChartData[];
  allByCapitalStockChartData: ChartData[];
  allByMarketPriceStockChartData: ChartData[];
}
