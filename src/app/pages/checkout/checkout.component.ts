import { Component, OnInit } from '@angular/core';
import { NgForm } from '@angular/forms';
import { Router } from '@angular/router';
import { delay, switchMap, tap } from 'rxjs/operators';
import { Details, Order } from 'src/app/shared/interfaces/order.interface';
import { Store } from 'src/app/shared/interfaces/stores.interface';
import { DataService } from 'src/app/shared/services/data.service';
import { OrderService } from 'src/app/shared/services/order.service';
import { ShoppingCartService } from 'src/app/shared/services/shopping-cart.service';
import { Product } from '../products/interfaces/product.interface';
import { ProductsService } from '../products/services/products.service';

@Component({
  selector: 'app-checkout',
  templateUrl: './checkout.component.html',
  styleUrls: ['./checkout.component.scss']
})

export class CheckoutComponent implements OnInit {

  model = {
    name: '',
    store: '',
    shippingAddress: '',
    city: ''
  };

  isDelivery = true;
  cart: Product[] = [];
  stores: Store[] = [];

  constructor(
    private dataService: DataService, 
    private orderService: OrderService, 
    private shoppingCartService: ShoppingCartService, 
    private productService: ProductsService,
    private router: Router,
    ) { }

  ngOnInit(): void {
    this.getStores();
    this.getDataCart();
    this.prepareDetails();
  }

  onPickupOrDelivery(value: boolean): void {
    this.isDelivery = value;
  }

  onSubmit({ value: formData }: NgForm): void {
    console.log('Save', formData);
    const data: Order = {
      ...formData,
      date: this.getCurrentDate(),
      isDelivery: this.isDelivery,
    }
    this.orderService.saveOrder(data)
    .pipe(
      tap( res => console.log('Order ->', res)),
      switchMap(({id: orderId}) => {
        const details = this.prepareDetails();
        return this.orderService.saveDetailsOrder({details, orderId})
      }),
      tap( () => this.router.navigate(['/checkout/thank-you-page'])),
      delay(2000),
      tap(() => this.shoppingCartService.resetCart())
    ).subscribe();
  }

  private getStores(): void {
    this.dataService.getStores()
    .pipe(tap((stores: Store[]) => this.stores = stores))
    .subscribe()
  }

  private getCurrentDate(): string {
    return new Date().toLocaleDateString();
  }

  private prepareDetails(): Details[] {
    const details: Details[] = [];
    this.cart.forEach((product: Product) => {
      const {id: orderId, name: productName, qty: quantity, stock} = product;
      const updateStock = (stock - quantity);

      this.productService.updateStock(orderId, updateStock)
      .pipe(
        tap(() => details.push({orderId, productName, quantity}))
      )
      .subscribe()
    })
    return details;
  }

  private getDataCart(): void {
    this.shoppingCartService.cartAction$
    .pipe(
      tap((products: Product[]) => this.cart = products)
    ).subscribe()
  }

}
