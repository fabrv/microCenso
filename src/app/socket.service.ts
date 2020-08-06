import { Subject } from 'rxjs/Subject';
import { Observable } from 'rxjs/Observable';
import * as io from 'socket.io-client';

export class EncuestaService {
    port: number = 8080;
    serverAddress: string = "http://192.168.43.93:" + this.port;
    socket:any;
    connectionFailures: number = 0;
    i: number = 0;

    save(message, questions){
        this.i = 0;
        this.socket = io.connect(this.serverAddress);

        this.socket.emit('insertForm', message);

        this.socket.io.on("connect_error", ()=> {
            this.connectionFailures += 1;

            if (this.connectionFailures > 2) {
                this.socket.disconnect();
                this.showAlert("<b>Error al guardar</b><br><hr> No se ha podido conectar al servidor, intentar mas tarde.");
            }
        });

        this.socket.on("rForm", (r)=>{
            if (r == "success"){
                this.saveQuestions(questions, message[0]);
            }else{
                if (r.number == 2627){
                    //console.log(r.message);

                  this.socket.disconnect();
                  this.deleteForm(message[0]);
                  this.save(message, questions);



                    //this.socket.disconnect();
                    //this.showAlert("<b>Error al guardar</b><br><hr> Ya existe un formulario con ese nombre.");
                }
            }
        });

        this.socket.on("rQuestion", (r)=>{
            if (r == "success"){
                if (this.i == (questions.length - 1)){
                    this.showAlert("Guardado correctamente");
                    this.socket.disconnect();
                }

                this.i++;
            }else{
                this.showAlert("<b>Error al guardar</b><br><hr>" + r);
            }
        });
    }



    saveQuestions(questions, formTitle){
        for (var i = 0; i < questions.length; i++){
            this.socket.emit('insertQuestion', [questions[i].title, questions[i].type, formTitle]);
            if (questions[i].type == 'multiple' || questions[i].type == 'unique'){
                this.saveList(questions[i].list)
            }
        }
    }

    saveList(items){
        for (var i = 0; i < items.length; i++){
            this.socket.emit("insertList", items[i])
        }
    }

    deleteForm(formTitle){
      this.connectionFailures = 0;
      this.socket = io.connect(this.serverAddress);

      this.socket.emit("deleteForm", formTitle);

      this.socket.io.on("connect_error", ()=> {
        this.connectionFailures += 1;

        if (this.connectionFailures > 2) {
          this.socket.disconnect();
          this.showAlert("<b>Error al eliminar formulario</b><br><hr> No se ha podido conectar al servidor, intentar mas tarde.");
        }
      });

      this.socket.on("rDeleteForm", (r)=>{
        if (r == "success"){
          this.showAlert("Formulario eliminado correctamente");
          this.socket.disconnect();
        }else{
          this.showAlert("<b>Error al eliminar formulario</b><br><hr>" + r);
        }
      });
    }


    getForms(){
      this.connectionFailures = 0;
      this.socket = io.connect(this.serverAddress);
      this.socket.emit('getForms', "");

      this.socket.io.on("connect_error", ()=> {
        this.connectionFailures += 1;

        if (this.connectionFailures > 2) {
          this.socket.disconnect();
          this.showAlert("<b>Error al traer formularios</b><br><hr> No se ha podido conectar al servidor, intentar mas tarde.");
        }
      });
    }


    observeForms() {
        let observable = new Observable(observer => {
            this.socket.on('rDesignedForms', (data) => {
                observer.next(data);
            });
            return () => {
                this.socket.disconnect();
            };
        });

        setTimeout(() => {
          this.socket.disconnect();
        }, 1000);
        return observable;
    }





    hideAlert(){
        document.getElementById("alert").style.opacity = '0';
        document.getElementById("fader").style.opacity = '0';


        setTimeout(() => {
            document.getElementById("alert").style.left = '-1000px';
            document.getElementById("fader").style.left = '-100%';
        }, 300)
    }

    showAlert(title: string){
        document.getElementById("alert").style.left = 'calc(50% - 150px)';
        document.getElementById("alert").style.opacity = '1';

        document.getElementById("fader").style.left = '0';
        document.getElementById("fader").style.opacity = '1';

        document.getElementById("alertText").style.display = 'initial';
        document.getElementById("alertButton").style.display = 'initial';

        document.getElementById("alertText").innerHTML = title;
        document.getElementById("loader").style.display = 'none'
    }
}
