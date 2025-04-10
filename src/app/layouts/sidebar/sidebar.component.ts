import { Component, OnInit, AfterViewInit, ElementRef, ViewChild, Input, OnChanges } from '@angular/core';
import MetisMenu from 'metismenujs';
import { EventService } from '../../core/services/event.service';
import { Router, NavigationEnd, RouterModule } from '@angular/router';

import { HttpClient } from '@angular/common/http';

import { MENU } from './menu';
import { MenuItem } from './menu.model';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { SimplebarAngularModule } from 'simplebar-angular';
import { CommonModule } from '@angular/common';
import { GeneralserviceService } from 'src/app/generalservice.service';

@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.scss'],
  standalone:true,
  imports:[SimplebarAngularModule,RouterModule,CommonModule,TranslateModule ]
})

/**
 * Sidebar component
 */
export class SidebarComponent implements OnInit, AfterViewInit, OnChanges {
  @ViewChild('componentRef') scrollRef;
  @Input() isCondensed = false;
  menu: any;
  data: any;

  menuItems: MenuItem[] = [];

  @ViewChild('sideMenu') sideMenu: ElementRef;
  loginData: any;

  constructor(private eventService: EventService, private router: Router, public translate: TranslateService, private http: HttpClient,private service:GeneralserviceService) {
    router.events.forEach((event) => {
      if (event instanceof NavigationEnd) {
        this._activateMenuDropdown();
        this._scrollElement();
      }
    });
  }

  ngOnInit() {
    this.loginData = null
    this.loginData= this.service.getLoginResponse()
    console.log("this.loginData",this.loginData);
    this.initialize();
    this._scrollElement();
  }

  ngAfterViewInit() {
    this.menu = new MetisMenu(this.sideMenu.nativeElement);
    this._activateMenuDropdown();
  }

  toggleMenu(event) {
    event.currentTarget.nextElementSibling.classList.toggle('mm-show');
  }

  ngOnChanges() {
    if (!this.isCondensed && this.sideMenu || this.isCondensed) {
      setTimeout(() => {
        this.menu = new MetisMenu(this.sideMenu.nativeElement);
      });
    } else if (this.menu) {
      this.menu.dispose();
    }
  }
  _scrollElement() {
    setTimeout(() => {
      if (document.getElementsByClassName("mm-active").length > 0) {
        const currentPosition = document.getElementsByClassName("mm-active")[0]['offsetTop'];
        if (currentPosition > 500)
          if (this.scrollRef.SimpleBar !== null)
            this.scrollRef.SimpleBar.getScrollElement().scrollTop =
              currentPosition + 300;
      }
    }, 300);
  }

  /**
   * remove active and mm-active class
   */
  _removeAllClass(className) {
    const els = document.getElementsByClassName(className);
    while (els[0]) {
      els[0].classList.remove(className);
    }
  }

  /**
   * Activate the parent dropdown
   */
  _activateMenuDropdown() {
    this._removeAllClass('mm-active');
    this._removeAllClass('mm-show');
    const links = document.getElementsByClassName('side-nav-link-ref');
    let menuItemEl = null;
    // tslint:disable-next-line: prefer-for-of
    const paths = [];
    for (let i = 0; i < links.length; i++) {
      paths.push(links[i]['pathname']);
    }
    var itemIndex = paths.indexOf(window.location.pathname);
    if (itemIndex === -1) {
      const strIndex = window.location.pathname.lastIndexOf('/');
      const item = window.location.pathname.substr(0, strIndex).toString();
      menuItemEl = links[paths.indexOf(item)];
    } else {
      menuItemEl = links[itemIndex];
    }
    if (menuItemEl) {
      menuItemEl.classList.add('active');
      const parentEl = menuItemEl.parentElement;
      if (parentEl) {
        parentEl.classList.add('mm-active');
        const parent2El = parentEl.parentElement.closest('ul');
        if (parent2El && parent2El.id !== 'side-menu') {
          parent2El.classList.add('mm-show');
          const parent3El = parent2El.parentElement;
          if (parent3El && parent3El.id !== 'side-menu') {
            parent3El.classList.add('mm-active');
            const childAnchor = parent3El.querySelector('.has-arrow');
            const childDropdown = parent3El.querySelector('.has-dropdown');
            if (childAnchor) { childAnchor.classList.add('mm-active'); }
            if (childDropdown) { childDropdown.classList.add('mm-active'); }
            const parent4El = parent3El.parentElement;
            if (parent4El && parent4El.id !== 'side-menu') {
              parent4El.classList.add('mm-show');
              const parent5El = parent4El.parentElement;
              if (parent5El && parent5El.id !== 'side-menu') {
                parent5El.classList.add('mm-active');
                const childanchor = parent5El.querySelector('.is-parent');
                if (childanchor && parent5El.id !== 'side-menu') { childanchor.classList.add('mm-active'); }
              }
            }
          }
        }
      }
    }

  }

  /**
   * Initialize
   */
  initialize(): void {
    console.log("this.menuItems",MENU)
    this.menuItems = MENU;
    console.log("this.menuItems",this.menuItems)
  }

//   initialize(): void {
//     console.log("Original MENU:", MENU);

//     if (!this.loginData?.data?.userActivity) {
//         console.log("No user activity found!");
//         return;
//     }

//     const userActivity = this.loginData.data.userActivity;

//     // Define access rules
//     const accessMap = {
//         'ADMIN': MENU, // Admin gets all components
//         'MD': [
//             { id: 2, label: "Dashboard", link: "/dashboard", parentId: 2, icon: "bx-home-circle" },
//             { id: 6, label: "Invoice Decision", link: "/InvoiceDecision", parentId: 1, icon: "bx-sync" },
//             { id: 7, label: "Invoice Reports", link: "/InvoiceReports", parentId: 1, icon: "bx bx-spreadsheet" }
//         ],
//         'ACCOUNTS': [
//             { id: 2, label: "Dashboard", link: "/dashboard", parentId: 2, icon: "bx-home-circle" },
//             { id: 7, label: "Invoice Reports", link: "/InvoiceReports", parentId: 1, icon: "bx bx-spreadsheet" },
//             { id: 3, label: "Customer Creation", link: "/CustomerCreation", parentId: 1, icon: "bx-user-check" }
//         ]
//     };

//     // Assign the allowed menu items based on user role
//     this.menuItems = accessMap[userActivity] || [];

//     console.log("Filtered menuItems:", this.menuItems);
// }



  /**
   * Returns true or false if given menu item has child or not
   * @param item menuItem
   */
  hasItems(item: MenuItem) {
    // console.log('item',item)
    return item.subItems !== undefined ? item.subItems.length > 0 : false;
  }
}
