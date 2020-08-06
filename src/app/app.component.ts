import { Component, Renderer, ElementRef, NgZone } from '@angular/core';
import * as io from 'socket.io-client';
import {EncuestaService} from "./socket.service";

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css', './bootstrap.min.css', './dashboard.css'],
  providers: [EncuestaService]
})
export class AppComponent  {

  sideMenu: any = [
    {title: 'Texto',            imageURL: 'app/img/abc.png',      type: "text"},
    {title: 'Numero',           imageURL: 'app/img/counter.png',  type: "number"},
    {title: 'Fecha',            imageURL: 'app/img/calendar.png', type: "date"},
    {title: 'Color',            imageURL: 'app/img/color.png',    type: "color"},
    {title: 'Opción Multiple',  imageURL: 'app/img/multiple.png', type: "multiple"},
    {title: 'Opción Unica',     imageURL: 'app/img/unique.png',   type: "unique"},
    {title: 'Imagen',           imageURL: 'app/img/image.png',    type: "image"},
  ];
  dragStarted: any;
  afterBlur: boolean = false;
  promptVal: string = "";
  questions: any = [];
  idListToAdd: number;
  formTitle: string = "";
  qTypes: any = [];
  forms: any = [];
  filteredForms: any = [];
  connection: any;
  formDelete: boolean = false;
  formToDelete: string;
  formFilter: string = "";

  constructor(private zone: NgZone, private socketService: EncuestaService) {
    /*this.globalListenFunc = renderer.listenGlobal('document', 'click', (event:any) => {
     console.log(event);
     console.log('Element clicked');
     });*/
    for (var i = 0; i < this.sideMenu.length; i++){
      if (this.sideMenu[i].title != "Grupo"){
        this.qTypes[i] = this.sideMenu[i];
      }
    }
  }

  dragStart(event: DragEvent) {
    event.dataTransfer.effectAllowed = 'move';
    this.dragStarted = event.target;
    this.dragStarted.style.opacity = .5;
  }

  allowDrop(event: any) {
    let elements: any = document.getElementsByClassName("formElements");
    event.preventDefault();

    for (let i = 0; i < elements.length; i++){
      if (elements[i].id == event.target.id){
        elements[i].style.marginTop = '30px';
      }else{
        elements[i].style.marginTop = '0px';
      }
    }
  }

  drop(event: any) {
    let elements: any = document.getElementsByClassName("formElements");
    let temp1: any;
    event.preventDefault();

    this.questions.splice(event.target.id, 0, this.questions[this.dragStarted.id]);


    if (event.target.id < this.dragStarted.id){
      this.questions.splice((parseInt(this.dragStarted.id) + 1), 1);
    }else{
      this.questions.splice(parseInt(this.dragStarted.id), 1);
    }

    for (let i = 0; i < this.questions.length; i++){
      this.questions[i].id = i
    }
  }

  dragEnd(event: any){
    this.dragStarted.style.opacity = 1;
    let elements: any = document.getElementsByClassName("formElements");
    for (let i = 0; i < elements.length; i++){
      elements[i].style.marginTop = '0px';
    }
  }

  createQuestion(type: any){
    let elements: any = document.getElementsByClassName("formElements");
    let contents: any = document.getElementsByClassName("panel-content");
    let lists:    any = document.getElementsByClassName("option-list");
    let Qtitle: string;
    if (type == 'group'){
      Qtitle = 'Grupo'
    }else{
      Qtitle = 'Pregunta'
    }
    this.questions[this.questions.length] =
      {
        title: Qtitle,
        type: type,
        id: this.questions.length,
        selected: true,
        list: []
      };

    setTimeout(() =>{
      let id: number = this.questions.length - 1;
      document.getElementById(id + "input").focus();
      (<HTMLInputElement>document.getElementById(this.questions.length - 1 + "input")).select();

      this.addClass(elements[id], 'panel-selected');
      this.addClass(contents[id], 'panel-content-selected');


      if (this.questions[id].type == 'multiple' || this.questions[id].type == 'unique'){
        for (let i = 0; i < lists.length; i++){
          if (parseInt(lists[i].id) == id){
            this.addClass(lists[i], 'hidden')
          }
        }
      }else if (this.questions[id].type == "group"){
        this.removeClass(elements[id], "panel");
        this.addClass(elements[id], 'panel-group');
        contents[id].style.borderTopLeftRadius = '5px';
        contents[id].style.borderTopRightRadius = '5px';
        contents[id].style.borderTop = '1px solid #DDD';
        contents[id].style.borderLeft = '1px solid #DDD';
        contents[id].style.borderRight = '1px solid #DDD';
      }
      //try{this.addClass(lists[id], 'hidden');}catch(e){}
    }, 10)
  }

  deleteItem(event: any){
    this.questions.splice(parseInt(event.target.id), 1);
    for (let i = 0; i < this.questions.length; i++){
      this.questions[i].id = i
    }
  }

  showHideInput(itemID: number){
    let lists:    any = document.getElementsByClassName("option-list");
    let elements: any = document.getElementsByClassName("formElements");
    let contents: any = document.getElementsByClassName("panel-content");

    if (this.afterBlur == false){
      this.questions[itemID].selected = true;
      setTimeout(() =>{

        document.getElementById(itemID + "input").focus();
        (<HTMLInputElement>document.getElementById(itemID + "input")).select();

        for (let i = 0; i < elements.length; i++){
          if (elements[i].id == itemID) {
            this.addClass(elements[i], 'panel-selected');
            if (this.questions[i].type == 'multiple' || this.questions[i].type == 'unique'){
              this.removeClass(elements[i], 'panel-list');
            }
          }
        }
        for (let i = 0; i < contents.length; i++){
          if (contents[i].id == itemID) {
            this.addClass(contents[i], 'panel-content-selected');
          }
        }

        for (let i = 0; i < lists.length; i++){
          if (parseInt(lists[i].id) == itemID){
            this.addClass(lists[i], 'hidden')
          }
        }
      }, 10)
    }
    this.afterBlur = false;
  }



  inputBlur(itemID: any){
    let elements: any = document.getElementsByClassName("formElements");
    let contents: any = document.getElementsByClassName("panel-content");
    let lists:    any = document.getElementsByClassName("option-list");


    this.questions[itemID].selected = false;
    this.afterBlur = true;

    for (let i = 0; i < elements.length; i++){
      if (elements[i].id == itemID) {
        this.removeClass(elements[i], 'panel-selected');
        if (this.questions[i].type == 'multiple' || this.questions[i].type == 'unique'){
          this.addClass(elements[i], 'panel-list');
        }
      }
    }

    for (let i = 0; i < lists.length; i++){
      if (lists[i].id == itemID){
        this.removeClass(lists[i], 'hidden')
      }
    }

    for (let i = 0; i < contents.length; i++){
      if (contents[i].id == itemID) {
        this.removeClass(contents[i], 'panel-content-selected')
      }
    }
  }



  onChangeObj(newObj: any, id: any) {
    let elements: any = document.getElementsByClassName("formElements");
    this.questions[id].type = newObj;
    if (newObj == 'multiple' || newObj == 'unique'){
      this.addClass(elements[id], 'panel-list');
    }else{
      this.removeClass(elements[id], 'panel-list');
    }
  }


  clear(){
    this.questions = [];
    this.formTitle = "";
  }


  showPrompt(id: number){
    this.idListToAdd = id;
    document.getElementById("input-prompt").focus();
    document.getElementById("prompt").style.left = 'calc(50% - 150px)';
    document.getElementById("prompt").style.opacity = '1';

    document.getElementById("fader").style.left = '0';
    document.getElementById("fader").style.opacity = '1';
  }

  showOpenDialog(){
    document.getElementById("open-dialog").style.left = 'calc(50% - 275px)';
    document.getElementById("open-dialog").style.opacity = '1';

    document.getElementById("fader").style.left = '0';
    document.getElementById("fader").style.opacity = '1';
    document.getElementById("input-filter").focus();
  }

  showAlert(title: string, loader: boolean){
    document.getElementById("alert").style.left = 'calc(50% - 150px)';
    document.getElementById("alert").style.opacity = '1';

    document.getElementById("fader").style.left = '0';
    document.getElementById("fader").style.opacity = '1';

    if (loader == true){
      document.getElementById("alertText").style.display = 'none';
      document.getElementById("alertButton").style.display = 'none';
      document.getElementById("loader").style.display = 'initial'
    }else{
      document.getElementById("alertText").style.display = 'initial';
      document.getElementById("alertButton").style.display = 'initial';
      document.getElementById("loader").style.display = 'none'
    }

    document.getElementById("alertText").innerHTML = title;
  }

  hidePrompt(){
    document.getElementById("prompt").style.opacity = '0';
    document.getElementById("fader").style.opacity = '0';


    setTimeout(() => {
      document.getElementById("prompt").style.left = '-1000px';
      document.getElementById("fader").style.left = '-100%';
    }, 300)
  }

  hideAlert(){
    document.getElementById("alert").style.opacity = '0';
    document.getElementById("fader").style.opacity = '0';

    setTimeout(() => {
      document.getElementById("alert").style.left = '-1000px';
      document.getElementById("fader").style.left = '-100%';
    }, 300)
  }

  hideDialog(){
    document.getElementById("open-dialog").style.opacity = '0';
    document.getElementById("fader").style.opacity = '0';

    setTimeout(() => {
      document.getElementById("open-dialog").style.left = '-1000px';
      document.getElementById("fader").style.left = '-100%';
    }, 300)
  }

  optionAdd(){
    if (this.promptVal != ''){
      this.questions[this.idListToAdd].list.push(this.promptVal);
      this.promptVal = '';
      this.hidePrompt();
    }
  }

  deleteListItem(id: number){
    let lists: any = document.getElementsByClassName("option-select");
    for (var i = 0; i < lists.length; i++){
      if (lists[i].id == id){
        this.questions[id].list.splice(lists[i].selectedIndex, 1)
      }
    }
  }

  inputPromptEnter(e: KeyboardEvent){
    if (e.keyCode == 13){
      this.optionAdd();
    }
  }


  save(){
    if (this.formTitle != "" && this.questions.length > 0){
      this.socketService.save([this.formTitle,JSON.stringify(this.questions)], this.questions);
      this.showAlert("", true);
    }else {
      this.showAlert("<b>Datos faltantes en el formulario</b><br><hr> Agregar preguntas o escribir un titulo para el formulario.", false)
    }
  }

  enterEv(event: KeyboardEvent){
    if (event.charCode == 13){
      document.getElementById((<HTMLElement>event.target).id).blur();
    }
  }

  //Class Functions
  addClass(element: HTMLElement, classToAdd:string){
    element.className += " " + classToAdd
  }
  removeClass(element: HTMLElement, classToRemove:string){
    var regex = new RegExp(classToRemove, 'g');
    element.className = element.className.replace(regex, '')
  }

  getForms(){
    this.socketService.getForms();

    this.connection = this.socketService.observeForms().subscribe(form =>{
      this.forms = form;
      this.filtro();
    })
  }

  openForm(event){
    this.questions = JSON.parse(this.forms[event.target.id].JSON);
    this.formTitle = this.forms[event.target.id].FORM_TITLE;
    this.hideDialog();
  }

  deleteFormClick(event){
    this.hideDialog();
    this.formDelete = true;
    this.formToDelete = this.forms[event.target.id].FORM_TITLE;

    setTimeout(()=>{
      this.showAlert("<b>¿Desea borrar permantemente el formulario?</b><br><hr> Una vez borrado un formulario no se podra recuperar.", false)
      document.getElementById("alertButton").style.display = 'none';
    }, 500);
  }

  deleteForm(){
    this.showAlert("", true);
    this.socketService.deleteForm(this.formToDelete)
  }

  filtro(){
    this.filteredForms = this.forms.filter((form)=>{
      return form.FORM_TITLE.toLowerCase().includes(this.formFilter.toString().toLowerCase());
    });
  }
}
