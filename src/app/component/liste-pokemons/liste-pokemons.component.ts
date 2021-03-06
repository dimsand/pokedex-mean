import { Component, OnInit } from '@angular/core';
import { PokeapiService } from '../../service/pokeapi.service'

@Component({
  selector: 'app-liste-pokemons',
  templateUrl: './liste-pokemons.component.html',
  styleUrls: ['./liste-pokemons.component.css']
})
export class ListePokemonsComponent implements OnInit {

  public loadingPokemons: boolean = false;
  private pokemons: Array<{}> = [{}];
  private nbPokemonsToRecup: number = 8;
  private percentLoadingPokemons: number = 0;
  private erreurRecupData: Boolean = false;
  private errApi: Array<String> = [""];
  private errApiPlus;

  constructor(private pokeapi:PokeapiService) { }

  filterPokemonByType(type){
    //this.pokemons = 
  }

  getRandomIntInclusive(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min)) + min;
  }

  randomPokemons(){
    this.pokemons = [{}];
    this.loadingPokemons = true;
    this.percentLoadingPokemons = 0;
    var nbRandom = this.getRandomIntInclusive(1, 802-this.nbPokemonsToRecup);
    console.log(nbRandom);
    for(let i=nbRandom; i<=(nbRandom+this.nbPokemonsToRecup); i++){
      setTimeout(()=>{ 
        var result: { inDB?: Boolean };
        this.pokeapi.getPokemonFromDb(i)
        .then(data => {
          console.log("RETOUR DB :");
          console.log(data);
          if(data != null){
            result = data;
            result.inDB = true;
            this.pokemons.push(data);
            var newPercent = Math.floor((this.pokemons.length/this.nbPokemonsToRecup) * 100);
            if(newPercent <= 100){
              this.percentLoadingPokemons = newPercent;
            }else{
              this.percentLoadingPokemons = 100;
              this.loadingPokemons = false;
            }
          }else{
            console.log("ESSAI API");
            this.pokeapi.getPokemonFromApi(i)
            .then(data => {
              console.log("RETOUR API");
              console.log(data);
              if(data != null){
                result = data;
                result.inDB = false;
                this.pokemons.push(result);
                var newPercent = Math.floor((this.pokemons.length/this.nbPokemonsToRecup) * 100);
                if(newPercent <= 100){
                  this.percentLoadingPokemons = newPercent;
                }else{
                  this.percentLoadingPokemons = 100;
                  this.loadingPokemons = false;
                }
              }else{
                console.log("PAS DE DONNES TROUVES DANS LA BDD ET DANS L'API pour le pokemon " + i);
                this.errApi.push("PAS DE DONNES TROUVES DANS LA BDD ET DANS L'API pour le pokemon " + i);
                this.errApiPlus = JSON.parse("PAS DE DONNES TROUVES DANS LA BDD ET DANS L'API pour le pokemon " + i);
                this.erreurRecupData = true;
                this.loadingPokemons = false;
              }
            })
            .catch(function(err){
              console.log(err);
              this.errApi.push(err);
              this.errApiPlus = JSON.parse(err._body);
              this.erreurRecupData = true;
              this.loadingPokemons = false;
            })
          }
        })
        .catch(function(err){
          console.log(err);
          this.errApi.push(err);
          this.errApiPlus = JSON.parse(err._body);
          this.erreurRecupData = true;
          this.loadingPokemons = false;
        })
      }, 1500);
    }
  }

  addToPokedex(pokemonId){
    console.log("ESSAI API");
    this.pokeapi.getPokemonFromApi(pokemonId)
    .then(data => {
      console.log("RETOUR API");
      console.log(data);
      if(data != null){
        // Enregistrement du pokémon en base
        console.log("ENREGISTREMENT DU POKEMON EN BASE")
        var pokemonToCreate: Object = {
          id: data['id'],
          name: data['name'],
          //name_fr: data['name'],
          sprites: data['sprites'],
          types: data['types'],
          weight: data['weight'],
          height: data['height'],
          //color: data['name'],
          stats: data['stats'],
          created_at: Date.now ,
        }
        console.log(pokemonToCreate)
        this.pokeapi.storePokemonInDb(pokemonToCreate)
        .then(data => {
          console.log("STORE POKEMON OK");
          console.log(this.pokemons)
        })
        .catch(function(err){
          console.log("ERREUR ENREGISTREMENT DU POKEMON EN BASE")
          console.log(err);
        })
      }else{
        console.log("PAS DE DONNES TROUVES DANS LA BDD ET DANS L'API pour le pokemon " + pokemonId);
        this.errApi.push("PAS DE DONNES TROUVES DANS LA BDD ET DANS L'API pour le pokemon " + pokemonId);
        this.errApiPlus = JSON.parse("PAS DE DONNES TROUVES DANS LA BDD ET DANS L'API pour le pokemon " + pokemonId);
      }
    })
    .catch(function(err){
      console.log(err);
    })
  }

  ngOnInit() {
    this.randomPokemons();
  }

}
