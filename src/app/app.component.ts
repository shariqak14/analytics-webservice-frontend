import { Component, OnInit } from "@angular/core";
import { FormBuilder, FormGroup } from "@angular/forms";
import { HttpClient } from "@angular/common/http";
import embed from "vega-embed";

@Component({
  selector: "app-root",
  templateUrl: "./app.component.html",
  styleUrls: ["./app.component.css"]
})
export class AppComponent implements OnInit {
  formGroup: FormGroup;

  onSubmit(formData: { [x: string]: any }) {
    this.http
      .get("http://localhost:5000/graph", {
        params: {
          query: formData["query"]
        }
      })
      .subscribe(data => {
        let spec = data[0];
        console.log(spec);
        embed("#vis", spec, { actions: false });
      });
  }

  constructor(private http: HttpClient, private formBuilder: FormBuilder) {
    this.formGroup = this.formBuilder.group({
      query: ""
    });
  }

  ngOnInit() {}
}
