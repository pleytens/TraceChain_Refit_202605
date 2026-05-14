import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-redirect',
  template: '<p>Redirecting...</p>', 
})
export class RedirectComponent implements OnInit {
  constructor(private router: Router, private route: ActivatedRoute) {}

  ngOnInit(): void {
    const docId = this.route.snapshot.queryParamMap.get('doc');
    if (docId) {
      this.router.navigate(['/t'], { queryParams: { d: docId } });
    } else {
      this.router.navigate(['/']); 
    }
  }
}
