import { Component, OnInit } from '@angular/core';

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

  constructor() { }

  ngOnInit(): void {
  }

}
