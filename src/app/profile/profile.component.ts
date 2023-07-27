import { Component, OnInit } from '@angular/core';
import { DataService } from '../shared/data.service';
import { SharedService } from '../shared/shared.service';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss'],
})
export class ProfileComponent implements OnInit {
  constructor(private dataService: DataService) {}

  ngOnInit(): void {
    this.fetchNFT();
  }

  fetchNFT() {
    this.dataService
      .fetchYourNFTs('0xa744eE8dc29FB7c58e9e8Ee0F78C6859822f12cc')
      .subscribe({
        next: (res) => {
          console.log(res);
        },
      });
  }
}
