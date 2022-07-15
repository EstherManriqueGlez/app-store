import { Component, OnInit } from '@angular/core';
import { NgForm } from '@angular/forms';
import { Router } from '@angular/router';
import { switchMap, tap } from 'rxjs';
import { Details, Order } from 'src/app/shared/interfaces/order.interface';
import { Store } from 'src/app/shared/interfaces/stores.interface';
import { DataService } from 'src/app/shared/services/data.service';
import { OrderService } from 'src/app/shared/services/order.service';
import { ShoppingCartService } from 'src/app/shared/services/shopping-cart.service';
import { Product } from '../products/interfaces/product.interface';

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

  constructor(private dataService: DataService, private orderService: OrderService, private shoppingCartService: ShoppingCartService, private router: Router) { }

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
      pickup: this.isDelivery,
    }
    this.orderService.saveOrder(data)
    .pipe(
      tap( res => console.log('Order ->', res)),
      switchMap(({id: orderId}) => {
        const details = this.prepareDetails();
        return this.orderService.saveDetailsOrder({details, orderId})
      }),
      tap( res => console.log('Finish ->', res)),
    ).subscribe()
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
      details.push({orderId, productName, quantity})
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
