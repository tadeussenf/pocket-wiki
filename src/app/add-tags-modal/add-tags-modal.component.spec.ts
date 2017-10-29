import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AddTagsModalComponent } from './add-tags-modal.component';

describe('AddTagsModalComponent', () => {
  let component: AddTagsModalComponent;
  let fixture: ComponentFixture<AddTagsModalComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AddTagsModalComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AddTagsModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
