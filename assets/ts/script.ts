const $ = (query: string) => document.querySelector(query) as HTMLInputElement;

interface Veiculo{
  nome: string;
  placa: string;
  entrada: string | string;
}


function calcTempo(mil: number){
  const min = Math.floor(mil / 60000);
  const sec = Math.floor((mil % 60000) / 1000);
  return `${min}m e ${sec}s`;
}


function checkInput(input: HTMLInputElement){
  const nome = input.value;

  const spanError = document.createElement('span');
  spanError.className = 'input-text-error';
  spanError.innerHTML = 'Campo vazio';
  

  if(!nome){
    input.classList.add('inputError');

    if(!input.nextElementSibling?.classList.contains('input-text-error')){
      input.after(spanError);
    }


  }else if(input.classList.contains('inputError')){

    if(input.nextElementSibling?.classList.contains('input-text-error')){
      input.nextElementSibling?.remove();
    }

    input.classList.remove('inputError');
  }
}


function abrirFecharForm(form: HTMLInputElement){

  // abrir e fechar form
  if (form.classList.contains('disabled')){

    form.classList.remove('disabled');

    if(form.classList.contains('form-cadastro-off')){
      form.classList.remove('form-cadastro-off');
    }

    form.classList.add('form-cadastro-on');

  }else{
    form.classList.add('disabled');
    form.classList.add('form-cadastro-off');
    form.classList.remove('form-cadastro-on');
  }

}


function fecharModal(modal: HTMLInputElement){
  modal.classList.add('modal-off');
  modal.classList.remove('modal-on');
}


function removerBtnHandler(removerBtn: HTMLInputElement, patio: Patio){
  removerBtn.addEventListener('click', function removerBtnClick (e){
    const btn = e.currentTarget as HTMLInputElement;
    const placa = btn.dataset.placa;

    patio.salvar(patio.ler().filter((veiculo) => veiculo.placa !== placa));
    
    fecharModal($('#remover-modal'));
    
    patio.render();

    removerBtn.removeEventListener('click', removerBtnClick);
  });
}


class Patio{
  ler(): Veiculo[]{
    return localStorage.patio ? JSON.parse(localStorage.patio) : [];
  }

  adicionar(veiculo: Veiculo, salva?: boolean){
    // Data
    const data = new Date(veiculo.entrada);
    const dia = data.getDate();
    const mes = data.getMonth() + 1;
    const ano = data.getFullYear();
    const hora = data.getHours();
    const minutos = data.getMinutes();
    const segundos = data.getSeconds();
    const entrada = `${dia < 10 ? '0' + dia : dia}/${mes < 10 ? '0' + mes : mes}/${ano} - ${hora}:${minutos}:${segundos}`;

    // Carro
    const divCarro = document.createElement('div');
    divCarro.innerHTML = `
      <div class="carro">

        <div class="nome-e-opcoes-carro">
          <span class="nome-veiculo">${veiculo.nome}</span>

          <div class="opcoes">

            <button class="deletar" data-placa="${veiculo.placa}">
              <i class="fa-regular fa-trash-can"></i>
            </button>

            <button class="editar" data-placa="${veiculo.placa}">
              <i class="fa-regular fa-pen-to-square"></i>
            </button>
            
          </div>

        </div>

        <div class="placa-e-entrada-carro">
          <span class="placa-veiculo">${veiculo.placa}</span>
          <span class="entrada-veiculo">${entrada}</span>
        </div>

      <div>
    `;

    // Opcao deletar carro
    divCarro.querySelector('.deletar')?.addEventListener('click', e => {
      const element = e.currentTarget as HTMLElement;
      const placa = element.dataset.placa as string;
      $('.remover').dataset.placa = placa;
      this.remover(placa);
    });

    // Opcao editar carro
    divCarro.querySelector('.editar')?.addEventListener('click', e => {
      const element = e.currentTarget as HTMLElement;
      const placa = element.dataset.placa as string;
      this.editar(placa);
    });

    // Anexar carro ao patio
    $('#patio').prepend(divCarro);

    // Salvar carro
    if(salva) this.salvar([...this.ler(), veiculo]);
  }

  editar(placa: string){
    
    // Modal editar
    const modalEditar = $("#editar-modal");
    const modalClassList = $("#editar-modal").classList;
    const modalForm = modalEditar.querySelector('#form-editar') as HTMLInputElement;
    const cancelarBtn = modalEditar.querySelector('.cancelar') as HTMLInputElement;
    const editarBtn = modalEditar.querySelector('.editar') as HTMLInputElement;
    const novoNomeInput = modalEditar.querySelector("#novo-nome") as HTMLInputElement;
    const novaPlacaInput = modalEditar.querySelector("#nova-placa") as HTMLInputElement;
    
    
    modalForm.addEventListener('submit', (e)=>{
      e.preventDefault();
    })

    // Encontrar veiculo
    const veiculos = this.ler();
    const veiculo = veiculos.find(veiculo => veiculo.placa === placa) as Veiculo;

    // Setar os inputs com os dados do carro a ser editado
    novoNomeInput.value = veiculo.nome;
    novaPlacaInput.value = veiculo.placa;
    

    // Abrir o Modal editar
    setTimeout(()=>{
      modalClassList.contains('modal-off') ? modalClassList.remove('modal-off') : '';
      modalClassList.add('modal-on');
    }, 170);


    modalEditar.addEventListener('click', e => {
      e.target === modalEditar ? fecharModal(modalEditar) : '';
    });
    


    // Fechar modal editar
    cancelarBtn.addEventListener('click', ()=>{
      fecharModal(modalEditar);
      novoNomeInput.value = '';
      novaPlacaInput.value = '';
    });



    // Editar o carro && Fechar modal editar
    editarBtn.addEventListener('click', ()=>{
      if(!novoNomeInput.value || !novaPlacaInput.value){
        alert('Os campos nome e placa são obrigatórios');
        return
      }

      veiculo.nome = novoNomeInput.value;
      veiculo.placa = novaPlacaInput.value;

      this.salvar(veiculos);
      fecharModal(modalEditar);
      this.render();
    });

  }

  remover(placa: string){
    // Modal remover
    const removerModal = $('#remover-modal');
    const formRemover = $('#form-remover');
    const removerBtn = $('.remover');
    const cancelarBtn = $('.cancelar');
    const removerTexto = formRemover.querySelector('#remover-texto') as HTMLElement;

    // Dados do carro a ser excluido
    const {entrada, nome} = this.ler().find(veiculo => veiculo.placa === placa) as Veiculo;
    
    // Tempo em que o carro permaneceu no patio
    const tempo = calcTempo(new Date().getTime() - new Date(entrada).getTime());
    
    formRemover.addEventListener('submit', e => e.preventDefault());

    // Mensagem do modal remover
    removerTexto.innerHTML = `O veículo ${nome} permaneceu por ${tempo}. Deseja encerrar?`;
    
    // abrir modal remover
    setTimeout(()=>{
      removerModal.classList.contains('modal-off') ? removerModal.classList.remove('modal-off') : '';
      removerModal.classList.add('modal-on');
    }, 170);

    // Fechar modal remover
    removerModal.addEventListener('click', e => {
      e.target === removerModal ? fecharModal(removerModal) : '';
    });
    
    // Voltar e fechar modal remover 
    cancelarBtn.addEventListener('click', () => fecharModal(removerModal));

    // Remover carro && Fechar modal remover
    removerBtnHandler(removerBtn, this);
  }

  salvar(veiculos: Veiculo[]){
    localStorage.setItem('patio', JSON.stringify(veiculos));
  }

  render(){
    $('#patio').innerHTML = '';
    const patio = this.ler();

    if(patio.length){
      patio.forEach((veiculo) => this.adicionar(veiculo))
    }
  }

  pesquisar(placa: string){
    if(!placa){
      $('#patio').innerHTML = '';
      return
    }

    $('#patio').innerHTML = '';

    const patio = this.ler();

    patio.forEach(veiculo => veiculo.placa.indexOf(placa) !== -1 ? this.adicionar(veiculo) : '');
  }
}



(function(){
  const patio = new Patio();
  const form = $('#form-cadastro');
  const nomeInput = $('#nome');
  const placaInput = $('#placa');
  const button = document.querySelector('#registrar-carro') as HTMLElement;
  const registrarBtn = $('#registrar-carro');
  const plusIcon = document.querySelector('#registrar-carro span') as HTMLElement;
  const pesquisarBtn = $('#pesquisar-btn');
  const voltarPatioBtn = $('#voltar-patio-btn');
  const pesquisarInput = $('#container-pesquisar input');

  let deg = 0;

  // Abrir input pesquisar
  pesquisarBtn.addEventListener('click', e => {
    setTimeout(()=>{
      $('#patio').innerHTML = '';
      pesquisarInput.classList.add('pesquisar-input-on');
      voltarPatioBtn.classList.add('voltar-patio-btn-on');

      $('#pesquisar-cadastrar-container').classList.add('off');
      
      // pesquisarBtn.classList.add('pesquisar-btn-off');
      // registrarBtn.classList.add('off');
      // $('#registrar-carro-desktop').classList.add('off');
    

      pesquisarInput.focus();
    }, 230);
  });

  // Pesquisar Carro
  pesquisarInput.addEventListener('keyup', e =>{
    const placa = e.currentTarget as HTMLInputElement;
    patio.pesquisar(placa.value);
  });

  // Voltar para o patio
  voltarPatioBtn.addEventListener('click', e =>{
    setTimeout(()=>{
      voltarPatioBtn.classList.remove('voltar-patio-btn-on');
      pesquisarInput.classList.remove('pesquisar-input-on');

      // pesquisarInput.classList.add('pesquisar-input-off');

      $('#pesquisar-cadastrar-container').classList.remove('off');


      pesquisarInput.value = '';
      
      patio.render();

    }, 230)

    
  })

  // Render patio
  patio.render();

  form.addEventListener('submit', (e)=>{
    e.preventDefault();
  });


  // Abrir form cadastro de carro
  registrarBtn.addEventListener('click', (e)=>{
    
    deg += 45;
    plusIcon.style.transform = `rotate(${deg}deg)`;
    plusIcon.style.transition = 'transform 0.2s ease-in';

    abrirFecharForm(form);

    registrarBtn.classList.toggle('registrar-carro-on');
  });


  $('#registrar-carro-desktop').addEventListener('click', e =>{
    const btn = e.currentTarget as HTMLInputElement;

    btn.style.zIndex = '-1';

    deg += 45;
    plusIcon.style.transform = `rotate(${deg}deg)`;
    plusIcon.style.transition = 'transform 0.2s ease-in';

    abrirFecharForm(form);

    registrarBtn.classList.toggle('registrar-carro-on');
  });


  $('#fechar-form-cadastro-btn').addEventListener('click', e =>{
    $('#registrar-carro-desktop').style.zIndex = '0';

    deg += 45;
    plusIcon.style.transform = `rotate(${deg}deg)`;
    plusIcon.style.transition = 'transform 0.2s ease-in';

    abrirFecharForm(form);

    registrarBtn.classList.toggle('registrar-carro-on');
  });




  // Checar os dados inseridos no cadastro de carro
  nomeInput.addEventListener('keyup', e => checkInput(e.currentTarget as HTMLInputElement));
  placaInput.addEventListener('keyup', e => checkInput(e.currentTarget as HTMLInputElement));

  
  // Cadastrar carro
  $('#cadastrar').addEventListener('click', e => {
    const nome = nomeInput.value;
    const placa = placaInput.value;

    checkInput(nomeInput);
    checkInput(placaInput);

    if(!nome || !placa){
      return;
    }

    patio.adicionar({nome, placa, entrada: new Date().toISOString()}, true)

    $('#nome').value  = '';
    $('#placa').value = '';

    form.classList.add('disabled');
    form.classList.remove('form-cadastro-on');
    form.classList.add('form-cadastro-off');

    
    deg += 45;
    plusIcon.style.transform = `rotate(${deg}deg)`;
    plusIcon.style.transition = 'transform 0.2s ease-in';
    button.classList.remove('registrar-carro-on');

  })

})();
