import { Component } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { HttpHeaders } from '@angular/common/http';

interface Product {
  name: string;
  link: string;
  specifications?: ProductSpecification[];
  imageLink?: string;
}

interface ProductResponse {
  productName: string;
}

interface ProductSpecification {
  key: string;
  value: string;
  imageLink: string;
}

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  productLink!: string;
  products: Product[] = [];
  isLoading = false;

  constructor(private http: HttpClient) {}

  addProduct(): void {
    const httpOptions = {
      headers: new HttpHeaders({'Content-Type': 'application/json'})
    }
  
    this.http.post<ProductResponse>('https://staples-compare.azurewebsites.net/api/products/scrape', JSON.stringify(this.productLink), httpOptions).subscribe(
      response => {
        const productName = response.productName;
        this.products.push({ name: productName, link: this.productLink });
        this.productLink = ''; // Clear the input field
      },
      error => {
        console.error('Error scraping product:', error);
      }
    );
  }

  compareProducts(): void {

    this.isLoading = true;

    const httpOptions = {
      headers: new HttpHeaders({'Content-Type': 'application/json'})
    }

    const productLinks = this.products.map(product => product.link);

    this.products.forEach((product, index) => {
      this.http.post<ProductSpecification[]>('https://staples-compare.azurewebsites.net/api/products/scrape-specifications', JSON.stringify([product.link]), httpOptions).subscribe(
        specifications => {
          product.specifications = specifications;
          product.imageLink = specifications[0].imageLink;

          if (index === this.products.length - 1) {
            this.isLoading = false;
          }
        },
        error => {
          console.error('Error scraping specifications:', error);
          this.isLoading = false;
        }
      );
    });
  }


  getProductKeys(): string[] {
    let maxKeysProduct: Product | undefined;
    let maxKeysCount = 0;
  
    for (const product of this.products) {
      if (product.specifications && product.specifications.length > maxKeysCount) {
        maxKeysProduct = product;
        maxKeysCount = product.specifications.length;
      }
    }
  
    return maxKeysProduct ? maxKeysProduct.specifications!.map(spec => spec.key) : [];
  }
  
  getProductSpecificationValue(product: Product, key: string): string {
    if (product.specifications && product.specifications.length > 0) {
      const specification = product.specifications.find(spec => spec.key === key);
      return specification ? specification.value : '';
    }
    return '';
  }

  removeProduct(product: Product): void {
    const index = this.products.indexOf(product);
    if (index !== -1) {
      this.products.splice(index, 1);
    }
  }
  
}
