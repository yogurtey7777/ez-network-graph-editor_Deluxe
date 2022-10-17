"use strict";




//インスペクタの表示中の要素のJSON
let nowSelectedElemData;


//コンテキストメニューのイベントをモーダルウィンドウに渡す用変数
let cxt_event;

//コンテキストメニュー→モーダルウィンドウで新規ノード作る処理
const cxt_new_node_generate = function (event) {



  let id_value = modal_node_id.value;
  if (id_value === "") {
    //idは空にできないので、適当な乱数を割り当てる
    id_value = Math.random().toString(32).substring(2);
  }

  let parent_value = modal_node_parent.value;
  if (parent_value === "") {
    parent_value = null;
  }

  let data = {
    group: 'nodes',
    id: `${id_value}`,
    label: `${modal_node_label.value}`,
    parent: `${parent_value}`
  };

  let pos = event.position || event.cyPosition;

  let style = {
    color: `${modal_node_labelcolor.value}`,
    'background-color': `${modal_node_backgroundcolor.value}`,
    shape: `${modal_node_shape.value}`
  }

  cy.add({
    data: data,
    position: {
      x: pos.x,
      y: pos.y
    },
    style: style
  });

  MicroModal.close('cxt_node_create');
}


//コンテキストメニュー→モーダルウィンドウで新規エッジ作る処理
const cxt_new_edge_generate = function (event) {



  let id_value = modal_edge_id.value;
  if (id_value === "") {
    //idは空にできないので、適当な乱数を割り当てる
    id_value = Math.random().toString(32).substring(2);
  }

  let data = {
    group: 'edges',
    id: `${id_value}`,
    source: `${modal_edge_source.value}`,
    target: `${modal_edge_target.value}`,
    label: `${modal_edge_label.value}`
  };

  let pos = event.position || event.cyPosition;

  let style = {
    color: `${modal_node_labelcolor.value}`,
    'line-color': `${modal_edge_linecolor.value}`,
    'target-arrow-color': `${modal_edge_t_arr_color.value}`,
    'target-arrow-shape': `${modal_edge_t_arr_shape.value}`,
    'source-arrow-color': `${modal_edge_s_arr_color.value}`,
    'source-arrow-shape': `${modal_edge_s_arr_shape.value}`,
    'background-color': `${modal_node_backgroundcolor.value}`,
    shape: `${modal_node_shape.value}`
  }

  cy.add({
    data: data,
    position: {
      x: pos.x,
      y: pos.y
    },
    style: style
  });

  MicroModal.close('cxt_edge_create');
}



//コンテキストメニューで色を変更する処理(ノード)
const target_node_color_change = function (target, color) {

  //呼び出す前に選択解除しているが一応判定する
  if (target.selected() === true) {

    //unselectで色反転が終了してから、
    // one(一回限り)にしないとtargetの選択が外される度に発動するので注意
    //https://js.cytoscape.org/#cy.one
    target.one('unselect', function () {

      //targetのスタイルのどれかの値が変更されたら(超重要なイベントです)
      //https://js.cytoscape.org/#events/collection-events
      //＝色反転が終了したら
      target.one('style', function () {
        //色を変更する
        target.style('background-color', `${color}`);
      });

    });
  } else {

    //普通の場合は普通に処理すればいい
    target.style('background-color', `${color}`);

  }
}

//コンテキストメニューで色を変更する処理(エッジ)
const target_edge_color_change = function (target, color) {

  //呼び出す前に選択解除しているが一応判定する
  if (target.selected() === true) {

    //unselectで色反転が終了してから、
    // one(一回限り)にしないとtargetの選択が外される度に発動するので注意
    //https://js.cytoscape.org/#cy.one
    target.one('unselect', function () {

      //targetのスタイルのどれかの値が変更されたら(超重要なイベントです)
      //https://js.cytoscape.org/#events/collection-events
      //＝色反転が終了したら
      target.one('style', function () {
        //色を変更する
        target.style('line-color', `${color}`);
        target.style('target-arrow-color', `${color}`);
        target.style('source-arrow-color', `${color}`);
      });

    });
  } else {

    //普通の場合は普通に処理すればいい
    target.style('line-color', `${color}`);
    target.style('target-arrow-color', `${color}`);
    target.style('source-arrow-color', `${color}`);

  }
}


//JSの読み込み早すぎてhtml関係の処理でエラー出るの回避するために
//DOMコンテンツがロードされた時に発火をさせる。
/*(重要)cytoscape.js関係のものもこれでやらないと動かない？*/
document.addEventListener('DOMContentLoaded', function () {


  //モーダルウィンドウの設定
  MicroModal.init({
    awaitOpenAnimation: true, //開くときのアニメーション
    awaitCloseAnimation: true, //閉じるときのアニメーション
    disableScroll: false,//モーダルを開いた時でもスクロールできるよう
  });

  //MicroModal.show('modal-id');
  //MicroModal.close('modal-id');


  //cytoscape.jsのグラフの設定
  let cy = window.cy = cytoscape({

    container: document.getElementById('cy'),//コンテナ


    autoungrabify: false, //ノードを掴めないのONにするか？
    autolock: false, //ノードをロックするか？
    boxSelectionEnabled: true,//ctrlによるボックス選択を可能にするか？

    //これがtrueだとクリックした時に自動選択されなくなる
    autounselectify: false,//クリックによる自動選択を有効にするか？

    //マウスホイールズームの感度
    wheelSensitivity: 0.1, //これがおそらくちょうどよい

    layout: {
      //結局は後で変えるので何でもOK
      //ノードの配置を動かしたのがページ更新で消えると困るので、
      //ここで色々変更することはしない
      name: 'dagre', //階層構造で表示
    },

    style: [
      {
        //ノードのデフォルトスタイル
        selector: 'node',
        css: {
          'shape': 'rectangle',//四角形
          'background-color': '#9dbaea',//背景は
          'content': 'data(label)',//文字はラベルの内容
          'text-valign': 'center',//文字を中央に配置
          'text-halign': 'center',//文字を中央に配置
          "width": 144,//幅はこれがちょうどよい
        }
      },
      {
        //親(parent)のノードのデフォルトスタイル
        selector: ':parent',
        css: {
          'background-color': 'white',//背景は白色
          'text-valign': 'top',//文字をノードの上に配置
          'text-halign': 'center',//文字を中央に配置
        }
      },
      {
        //エッジのデフォルトスタイル
        selector: 'edge',
        style: {
          'width': 4,//普通の幅の線
          'content': 'data(label)', //ノードに表示するのはラベルの値
          'target-arrow-shape': 'triangle',//エッジの先端の形状
          'line-color': '#DA1725',//エッジの色
          'target-arrow-color': '#DA1725',//エッジの先端の色
          'curve-style': `${edge_curve.value}`//選択後にページ更新で変わるように
        }
      },
      {
        //選択したノードやエッジのスタイル
        selector: ':selected',
        style: {
          //'background-color': 'red'//選択したやつを赤くする
        }
      },

    ],

  });


  //消したやつを保存するリスト
  //リロードするとリセットになるので注意
  let removed_list = [];

  //右クリックすると出てくるメニューの設定
  let contextMenu = cy.contextMenus({



    menuItems: [
      {
        id: 'add-node',
        content: '上部分の設定で新規ノード作る',
        tooltipText: 'add node',
        coreAsWell: true,
        hasTrailingDivider: true,
        onClickFunction: function (event) {

          //クイックメニューの値をモーダルウィンドウにわたす
          modal_node_parent.value = qmenu_elem_parent.value;

          //イベントをモーダルウィンドウに渡す
          cxt_event = event;

          //モーダルウィンドウを表示する
          MicroModal.show('cxt_node_create');

        }
      },
      {
        id: 'add-edge',
        content: '上部分の設定で新エッジ作る',
        tooltipText: 'add node',
        coreAsWell: true,
        hasTrailingDivider: true,
        onClickFunction: function (event) {

          modal_edge_source.value = qmenu_elem_source.value;
          modal_edge_target.value = qmenu_elem_target.value;

          //イベントをモーダルウィンドウに渡す
          cxt_event = event;
          //モーダルウィンドウを表示する
          MicroModal.show('cxt_edge_create');
        }
      },
      {
        id: 'copy-node',
        content: 'ノードをコピー(idはランダム)',
        tooltipText: 'copy-id-parent',
        selector: 'node',
        hasTrailingDivider: true,
        onClickFunction: function (event) {
          let target = event.target || event.cyTarget;
          let target_c = target.copy();

          let data = {
            group: 'nodes',
            id: `${Math.random().toString(32).substring(2)}`,
            label: `${target.data('label')}`,
            parent: null //親は無しにする
          };

          let pos = event.position || event.cyPosition;
          let style = {
            color: `${target.style('color')}`,
            'background-color': `${target.style('background-color')}`,
            shape: `${target.style('shape')}`
          };
          cy.add({
            data: data,
            position: {
              x: pos.x,
              y: pos.y + 10
            },
            style: style
          });

          //qmenu_elem_parent.value = target.data('id');
        },
      },
      {
        id: 'copy-id-parent',
        content: 'Qメニューのparentにidコピー',
        tooltipText: 'copy-id-parent',
        selector: 'node',
        hasTrailingDivider: true,
        onClickFunction: function (event) {
          let target = event.target || event.cyTarget;
          qmenu_elem_parent.value = target.data('id');
        },
      },
      {
        id: 'copy-id-source',
        content: 'Qメニューのsourceにidコピー',
        tooltipText: 'copy-id-source',
        selector: 'node',
        hasTrailingDivider: true,
        onClickFunction: function (event) {
          let target = event.target || event.cyTarget;
          qmenu_elem_source.value = target.data('id');
        },
      },
      {
        id: 'copy-id-target',
        content: 'Qメニューのtargetにidコピー',
        tooltipText: 'copy-id-target',
        selector: 'node',
        hasTrailingDivider: true,
        onClickFunction: function (event) {
          let target = event.target || event.cyTarget;
          qmenu_elem_target.value = target.data('id');
        },
      },

      {
        //右クリックからノードの色を変更する
        id: 'node-color',
        content: 'ノードの色を変更する',
        tooltipText: 'change color',
        selector: 'node',
        hasTrailingDivider: true,
        submenu: [
          {
            id: 'selecting_color',
            content: '上の部分で選択した色に変更',
            tooltipText: 'select-color',
            hasTrailingDivider: true,
            onClickFunction: function (event) {

              let target = event.target || event.cyTarget;
              target.unselect(); //選択を解除する(選択の色変更との競合防ぐ)
              target_node_color_change(target, `${select_changecolor.value}`);
            },
          },
          {
            id: 'reverse_color-node',
            content: '現在の色を反転させる',
            tooltipText: 'select-color',
            hasTrailingDivider: true,
            onClickFunction: function (event) {
              let target = event.target || event.cyTarget;

              target.unselect(); //選択を解除する(選択の色変更との競合防ぐ)
              let rgb = ColorToHex(target.style('background-color'));

              //選択の状態が解除されて選択色から元の色に戻った時点で色を反転させる
              if (target.selected() === true) {
                console.log("bug");
                target.one('unselect', function (event) {
                  //targetのスタイルのどれかの値が変更されたら(超重要なイベントです)
                  //https://js.cytoscape.org/#events/collection-events
                  //＝選択による色変更が終了したら

                  target.one('style', function () {
                    //色を変更する
                    rgb = ColorToHex(target.style('background-color'));
                    target.style('background-color', `${invertColor(rgb)}`);
                  });


                });
              } else {
                //選択されてない場合は、普通にそのまま判定させればOK
                target_node_color_change(target, `${invertColor(rgb)}`);
              }
            },
          },
          {
            id: 'color-light-gray',
            content: 'ライトグレー',
            tooltipText: 'light-gray',
            hasTrailingDivider: true,
            onClickFunction: function (event) {
              let target = event.target || event.cyTarget;
              target.unselect();
              target_node_color_change(target, '#969998');
            },
          },
          {
            id: 'color-blue',
            content: 'ブルー',
            tooltipText: 'blue',
            onClickFunction: function (event) {
              let target = event.target || event.cyTarget;
              target.unselect();
              target_node_color_change(target, 'blue');
            },
            submenu: [
              {
                id: 'color-light-blue',
                content: 'ライトブルー',
                tooltipText: 'light blue',
                hasTrailingDivider: true,
                onClickFunction: function (event) {
                  let target = event.target || event.cyTarget;
                  target.unselect();
                  target_node_color_change(target, 'lightblue');
                  //選択中(色反転)に色変更されたことを想定
                },
              },
              {
                id: 'color-dark-blue',
                content: 'ダークブルー',
                tooltipText: 'dark blue',
                hasTrailingDivider: true,
                onClickFunction: function (event) {
                  let target = event.target || event.cyTarget;
                  target.unselect(); //選択を解除する(選択の色変更との競合防ぐ)
                  target_node_color_change(target, 'darkblue');
                },
              },
            ],
          },
          {
            id: 'color-green',
            content: 'グリーン',
            tooltipText: 'green',
            hasTrailingDivider: true,
            onClickFunction: function (event) {
              let target = event.target || event.cyTarget;
              target.unselect(); //選択を解除する(選択の色変更との競合防ぐ)
              target_node_color_change(target, 'green');
            },
          },
          {
            id: 'color-red',
            content: 'レッド',
            tooltipText: 'red',
            onClickFunction: function (event) {
              let target = event.target || event.cyTarget;
              target.unselect(); //選択を解除する(選択の色変更との競合防ぐ)
              target_node_color_change(target, 'red');
            },
          },
        ]
      },
      {
        //右クリックからエッジの色を変更する
        id: 'edge-color',
        content: 'エッジの色を変更する',
        tooltipText: 'change color',
        selector: 'edge',
        hasTrailingDivider: true,
        submenu: [
          {
            id: 'color-select-color',
            content: '上の部分で選択した色に変更',
            tooltipText: 'select-color',
            onClickFunction: function (event) {
              let target = event.target || event.cyTarget;
              target.unselect(); //選択を解除する(選択の色変更との競合防ぐ)
              target_edge_color_change(target, `${select_changecolor.value}`);
            },
          },
          {
            id: 'reverse_color-edge',
            content: '現在の色を反転させる',
            tooltipText: 'select-color',
            hasTrailingDivider: true,
            onClickFunction: function (event) {
              let target = event.target || event.cyTarget;
              target.unselect(); //選択を解除する(選択の色変更との競合防ぐ)
              let rgb = ColorToHex(target.style('line-color'));


              //選択の状態が解除されて選択色から元の色に戻った時点で色を反転させる
              if (target.selected() === true) {
                target.one('unselect', function () {
                  //targetのスタイルのどれかの値が変更されたら(超重要なイベントです)
                  //https://js.cytoscape.org/#events/collection-events
                  //＝選択による色変更が終了したら
                  target.one('style', function () {

                    //色を変更する
                    rgb = ColorToHex(target.style('line-color'));
                    target.style('line-color', `${invertColor(rgb)}`);
                    target.style('target-arrow-color', `${invertColor(rgb)}`);
                    target.style('source-arrow-color', `${invertColor(rgb)}`);
                  });

                });
              } else {
                //選択されてない場合は、普通にそのまま判定させればOK
                target_edge_color_change(target, `${invertColor(rgb)}`);

              }
            },
          },
          {
            id: 'color-light-gray',
            content: 'ライトグレー',
            tooltipText: 'light-gray',
            onClickFunction: function (event) {
              let target = event.target || event.cyTarget;
              target.unselect(); //選択を解除する(選択の色変更との競合防ぐ)
              target_edge_color_change(target, `#969998`);
            },
          },
          {
            id: 'color-blue',
            content: 'ブルー',
            tooltipText: 'blue',
            onClickFunction: function (event) {
              let target = event.target || event.cyTarget;
              target_edge_color_change(target, 'blue');
            },
            submenu: [
              {
                id: 'color-light-blue',
                content: 'ライトブルー',
                tooltipText: 'light blue',
                onClickFunction: function (event) {
                  let target = event.target || event.cyTarget;
                  target.unselect(); //選択を解除する(選択の色変更との競合防ぐ)
                  target_edge_color_change(target, 'lightblue');
                },
              },
              {
                id: 'color-dark-blue',
                content: 'ダークブルー',
                tooltipText: 'dark blue',
                onClickFunction: function (event) {
                  let target = event.target || event.cyTarget;
                  target.unselect(); //選択を解除する(選択の色変更との競合防ぐ)
                  target_edge_color_change(target, 'darkblue');
                },
              },
            ],
          },
          {
            id: 'color-green',
            content: 'グリーン',
            tooltipText: 'green',
            onClickFunction: function (event) {
              let target = event.target || event.cyTarget;
              target.unselect(); //選択を解除する(選択の色変更との競合防ぐ)
              target_edge_color_change(target, 'green');
            },
          },
          {
            id: 'color-red',
            content: 'レッド',
            tooltipText: 'red',
            onClickFunction: function (event) {
              let target = event.target || event.cyTarget;
              target.unselect(); //選択を解除する(選択の色変更との競合防ぐ)
              target_edge_color_change(target, 'red');
            },
          },
        ]
      },
      {
        id: 'change-node-parent',
        content: 'parentをQメニューの値に変更',
        tooltipText: 'copy-id-target',
        selector: 'node',
        hasTrailingDivider: true,
        onClickFunction: function (event) {
          let target = event.target || event.cyTarget;
          target = target.move({
            parent: `${qmenu_elem_parent.value}`
          });
        },
      },
      {
        id: 'change-elem-label',
        content: 'labelをQメニューの値に変更',
        tooltipText: 'select-label',
        selector: 'node, edge',
        onClickFunction: function (event) {
          let target = event.target || event.cyTarget;
          target.data('label', `${select_changelabel.value}`);
        },
      },
      {
        id: 'delete-node-parent',
        content: 'parentをnullにして削除する',
        tooltipText: 'copy-id-target',
        selector: 'node',
        hasTrailingDivider: true,
        onClickFunction: function (event) {
          let target = event.target || event.cyTarget;
          target = target.move({
            parent: null
          });
        },
      },

      {
        id: 'undo-last-remove',
        content: 'ノード/エッジを復元する',
        selector: 'node, edge',
        show: false,
        coreAsWell: true,
        onClickFunction: function (event) {
          if (1 <= removed_list.length) {
            (removed_list.pop()).restore();

            if (removed_list.length === 0) {
              contextMenu.hideMenuItem('undo-last-remove');
            }
          } else {
            //配列の長さが0＝空だった場合はおかしい
            console.log("restore error");
          }
        },
        hasTrailingDivider: true
      },
      {
        id: 'remove',
        content: 'ノード/エッジを削除(復元可)',
        tooltipText: 'remove',
        selector: 'node, edge',
        onClickFunction: function (event) {
          var target = event.target || event.cyTarget;

          removed_list.push(target.remove()); //消したやつを消したやつリストに追加
          contextMenu.showMenuItem('undo-last-remove');
        },
        hasTrailingDivider: true
      }
    ],
    contextMenuClasses: ['context_menu'],
    menuItemClasses: ['context_menu_item']


  });





  //重要
  //ここでパンズーム(ズームバー)を表示させる
  cy.panzoom();


  // ここでエッジの折り曲げを有効にする
  //右クリックのメニューにエッジ関係の項目を追加？
  cy.edgeEditing({
    undoable: true,
    bendRemovalSensitivity: 16,
    enableMultipleAnchorRemovalOption: true,
    initAnchorsAutomatically: false,
    useTrailingDividersAfterContextMenuOptions: true,
    enableCreateAnchorOnDrag: true
  });

  //ここでエッジ折り曲げのスタイルの変化を反映している？？？
  cy.style().update();

  /*
  //右クリックしたノードを削除する
  cy.on('cxttap', 'node', function () {
    if (this.scratch().restData == null) {
      this.scratch({
        restData: this.remove()
      });
    }
  });
   
  //右クリックしたエッジを削除する
  cy.on('cxttap', 'edge', function () {
    if (this.scratch().restData == null) {
      this.scratch({
        restData: this.remove()
      });
    }
  });
  */



  //ノードとエッジをクリックした時の処理(インスペクタ用)
  cy.on('click', 'node, edge', function (event) {
    //console.log(event.target.data('id'));

    //インスペクタに出ているものを、編集の方に回す用
    nowSelectedElemData = event.target;
    //console.log(nowSelectedElemData);


    //共通の情報
    console.log(event.target.group());
    now_elem_group.value = event.target.group(); //要素は種類は固定
    now_elem_id.value = event.target.data('id'); //idは変更不可能
    now_changelabel.value = event.target.data('label');
    now_pos_x.value = event.target.position('x');
    now_pos_y.value = event.target.position('y');

    if (event.target.selected() === true) {
      //選択されてる＝背景色変わってるのでインスペクタに反映はしない
    }
    else {
      now_labelcolor.value = ColorToHex(event.target.style('color'));
      now_labelcolor_str.value = ColorToHex(event.target.style('color'));
    }


    //ノードだけの情報
    if (event.target.group() === "nodes") {

      now_elem_type_node.checked = true;
      edge_inspector.classList.add("disabled");
      node_inspector.classList.remove("disabled");

      //ノードだけの情報をインスペクタに反映する
      now_parent.value = event.target.data('parent');

      if (event.target.selected() === true) {
        //選択されてる＝背景色変わってるのでインスペクタに反映はしない
      }
      else {
        now_backgroundcolor.value = ColorToHex(event.target.style('background-color'));
        now_backgroundcolor_str.value = ColorToHex(event.target.style('background-color'));
      }
      now_shape.value = event.target.style('shape');

      now_source.value = "";
      now_target.value = "";
      now_linecolor.value = "";
      now_linecolor_str.value = "";
      now_t_arr_color.value = "";
      now_t_arr_color_str.value = "";
      now_t_arr_shape.value = "";
      now_s_arr_color.value = "";
      now_s_arr_color_str.value = "";
      now_s_arr_shape.value = "";

    } else {

      now_elem_type_edge.checked = true;
      node_inspector.classList.add("disabled");
      edge_inspector.classList.remove("disabled");

      now_parent.value = "";
      now_backgroundcolor.value = "";
      now_backgroundcolor_str.value = "";
      now_shape.value = "";

      //エッジだけの情報をインスペクタに反映する
      now_source.value = event.target.data('source');
      now_target.value = event.target.data('target');


      now_t_arr_shape.value = event.target.style('target-arrow-shape');
      now_s_arr_shape.value = event.target.style('source-arrow-shape');
      if (event.target.selected() === true) {
        //選択されてる＝背景色変わってるのでインスペクタに反映はしない
      }
      else {
        now_linecolor.value = ColorToHex(event.target.style('line-color'));
        now_linecolor_str.value = ColorToHex(event.target.style('line-color'));
        now_t_arr_color.value = ColorToHex(event.target.style('target-arrow-color'));
        now_t_arr_color_str.value = ColorToHex(event.target.style('target-arrow-color'));
        now_s_arr_color.value = ColorToHex(event.target.style('source-arrow-color'));
        now_s_arr_color_str.value = ColorToHex(event.target.style('source-arrow-color'));
      }


    }




    console.log(event.target.style('background-color'));

    //console.log(typeof (event.target.style('background-color')));
    //ColorToHex

  });



  cy.on('mouseover', 'node, edge', function (event) {

    //クイック編集機能の所に表示する機能
    qmenu_mouseover_elem_id.value = event.target.data('id');
    qmenu_mouseover_elem_label.value = event.target.data('label')

  });


  //超超超超超超重要メモ：ノードをマウスクリックで選択した時のイベントの順番
  //select => free =>unselect
  //grab => select => drag => free => unselect

  //選択されたノードの色を変更する
  //https://js.cytoscape.org/#events/collection-events
  //https://stackoverflow.com/questions/68112947/cytoscape-js-check-when-all-nodes-are-unselected 
  //styleで指定されてるやつは、jsonで直接色指定している場合は使えない
  //なので、このようにselectイベント発生時に変える必要がある
  //selectされたやつがfreeになったら色を元に戻す

  //コンテキストメニューでの色変更に関して、
  //「選択(select)での色変更」→「コンテキストメニューでの色変更」→「非選択(unselect)での色変更」
  //となってしまうのを防ぐためにこのような「selectで色反転→unselect元に戻す」
  //「コンテキストの方はunselect後のstyle変更時に色変更」という処理をしている



  cy.on('select', 'node, edge', function (event) {
    let select_elem_prop_color;
    let select_elem_prop_back_color;

    if (event.target.group() === "nodes") {

      select_elem_prop_color = event.target.style('color');
      select_elem_prop_back_color = event.target.style('background-color');
      event.target.style('color', `#fc4d4d`);
      event.target.style('background-color', `#3894fc`);

    } else {
      select_elem_prop_color = event.target.style('color');
      select_elem_prop_back_color = event.target.style('line-color');

      event.target.style('color', `#fc4d4d`);
      event.target.style('line-color', `#3894fc`);
      event.target.style('target-arrow-color', `#3894fc`);
      event.target.style('source-arrow-color', `#3894fc`);
    }

    /*色反転にしていたときのやつ
    if (event.target.group() === "nodes") {
      let rgb = ColorToHex(event.target.style('background-color'));
      event.target.style('background-color', `${ invertColor(rgb) }`);

    } else {
      let rgb = ColorToHex(event.target.style('line-color'));
      event.target.style('line-color', `${ invertColor(rgb) }`);
      event.target.style('target-arrow-color', `${ invertColor(rgb) }`);
      event.target.style('source-arrow-color', `${ invertColor(rgb) }`);
    }
    */

    //ここでoneにしないと、一回選択されたやつが解除される度に実行されてしまう
    event.target.one("unselect", function () {
      console.log("test:unselect");
      if (event.target.group() === "nodes") {
        event.target.style('color', select_elem_prop_color);
        event.target.style('background-color', select_elem_prop_back_color);

      } else {
        event.target.style('color', select_elem_prop_color);
        event.target.style('line-color', select_elem_prop_back_color);
        event.target.style('target-arrow-color', select_elem_prop_back_color);
        event.target.style('source-arrow-color', select_elem_prop_back_color);
      }
    });

    /*
      cy.on("unselect", 'node, edge', function (event) {
    
        if (event.target.group() === "nodes") {
          event.target.style('color', select_elem_prop_color);
          event.target.style('background-color', select_elem_prop_back_color);
    
        } else {
          event.target.style('color', select_elem_prop_color);
          event.target.style('line-color', select_elem_prop_back_color);
          event.target.style('target-arrow-color', select_elem_prop_back_color);
          event.target.style('source-arrow-color', select_elem_prop_back_color);
        }
    
      });
    */


    //選択が解除されたときの処理
    //https://js.cytoscape.org/#events/collection-events
    //複数選択して右クリックで色変更した時、色変更後にこれが適用されるの防ぐため
    //右クリックの色変更の方でターゲットの選択解除を行う必要があるのを注意


    //マウスから離れた時の処理
    //https://js.cytoscape.org/#events/collection-events 
    //https://github.com/cytoscape/cytoscape.js/issues/1918 





    //ノードかエッジかで何かするための部分(未実装)
    // let now_elem_type_btn = document.querySelectorAll(`input[type = 'radio'][name = 'now_elem_type']`);
    // if (elem_btn.id === 'now_elem_type_node') {
    //   //ノードの時の処理
    // } else {
    //   //エッジの時の処理
    // }

    /*
    now_elem_type_btn.forEach(function (elem_btn) {
      elem_btn.addEventListener("change", function () {
        console.log("tetetetetetetetete");
  
        if (elem_btn.id === 'now_elem_type_node') {
          edge_inspector.classList.add("disabled");
          node_inspector.classList.remove("disabled");
        } else {
          node_inspector.classList.add("disabled");
          edge_inspector.classList.remove("disabled");
        }
      });
    });*/


  });


});





//cytoscape.jsの[ノードかエッジ].style('color')で
//出てくる色データが文字列の「rgb(000,000,000)」なので
//それをHEXに変換するための関数
function ColorToHex(color) {
  let num_pick = /\d+/g;
  let three_num = color.match(num_pick);
  //console.log(three_num);

  let resultHex = "#";
  three_num.forEach(function (num) {
    //文字列なので、数値に直してから、再度16進数文字列にする
    let hex_part = parseInt(num).toString(16);
    if (hex_part.length == 1) {
      //長さが1個だった場合は左側に0を付ける
      resultHex += "0" + hex_part;
    } else {
      //長さが2個だった場合は普通にそのまま
      resultHex += hex_part;
    }
  });
  //console.log(resultHex);
  return resultHex;
}

//HEXの色を反転してリターンする
//"#000000"の文字列にのみ対応
//https://www.web-dev-qa-db-ja.com/ja/javascript/823691380/
function invertColor(hex) {

  hex = hex.slice(1);

  if (hex.indexOf('#') === 0) {
    hex = hex.slice(1);
  }

  // RGBに変換して、256から引いたものが反転色＆再度HEXに変換
  let r = (255 - parseInt(hex.slice(0, 2), 16)).toString(16);
  let g = (255 - parseInt(hex.slice(2, 4), 16)).toString(16);
  let b = (255 - parseInt(hex.slice(4, 6), 16)).toString(16);

  // pad each with zeros and return
  return '#' + padZero(r) + padZero(g) + padZero(b);
}

function padZero(hex_part) {
  let r_hex_part = "";

  if (hex_part.length == 1) {
    //長さが1個だった場合は左側に0を付ける
    r_hex_part = "0" + hex_part;
  } else {
    r_hex_part = hex_part;
  }

  return r_hex_part;
}



//ファイルに使用できない記号を置換する
const filename_replace = function (target_string) {
  let string = target_string
  //ウィンドウズのファイル名で使用できない記号
  let marks = ["\\", '/', ':', '*', '?', "<", ">", '|'];

  //全部置き換えて消す
  marks.forEach(function (element) {
    string = string.replace(element, 'ぬ')
  });
  return string
}

//png画像で保存する処理
const downloadPng = function () {

  let a = document.createElement('a');

  let option = {
    output: "blob",
    scale: parseFloat($('#png_scale').val()),
  };

  let bg = $('#colorPicker').val();

  if (tras_yes.checked === true) {
    option["bg"] = "#00000000";
    //console.log("testtete")
  } else {
    option["bg"] = bg;
  }

  let blob = new Blob([
    window.cy.png(option)
  ], { 'type': 'application/octet-stream' });

  a.href = window.URL.createObjectURL(blob);

  let filename = $("#png_name").val();
  a.download = filename_replace(filename) + ".png";
  a.click();
};


//SVGを保存させる関数
const saveAsSvg = function () {
  let svgContent = cy.svg({ scale: 1, full: true });
  let blob = new Blob([svgContent], { type: "image/svg+xml;charset=utf-8" });

  let filename = $("#svg_name").val();
  saveAs(blob, filename_replace(filename) + ".svg");
};

//SVGを閲覧する関数
const getSvgUrl = function () {
  let svgContent = cy.svg({ scale: 1, full: true });
  let blob = new Blob([svgContent], { type: "image/svg+xml;charset=utf-8" });
  let url = URL.createObjectURL(blob);

  window.open(url, "_target");//別窓でblobのURLを開く
  URL.revokeObjectURL(url); //blobのURLのメモリを開放する？(うまく行ってるか不明)
  //return url;
};




//レイアウトを選択して変更する処理
const changeLayout = function () {
  let layout = cy.layout({
    name: `${selectLayout.value}`,
    fit: true,
    animate: true
  });
  layout.run();
};


//図のJSONを読み込む処理
const readGraphJson = function () {
  console.log("test")
  let elements = cy.elements();
  cy.remove(elements);

  //eval使うと楽だけど、脆弱性になるので使わない
  //cy.add(eval($("#LoadJsonData").val()));

  //JSONにケツカンマがあった場合は削除する。
  const load_data = (LoadJsonData.value).replaceAll(",}", "}").replaceAll(/,\n*]/g, "\n]");
  console.log(load_data)
  cy.add(JSON.parse(load_data));
};

//図のJSONに要素を追加する処理
const addGraphJson = function () {
  let elems = eval($("#AddJsonData").val());
  cy.add(elems);
};





//図のJSONを保存する処理
//ケツカンマは読み込み時に消すのであってもOK
//数字は文字列にするとエラーなのでそのまま出す
const graphJsonSave = function () {
  let s = "";
  s += "[\n";


  let node_json = "";
  let edge_json = "";

  //いま出ているノードのJSONを文字列に変換
  let nodes = cy.nodes();

  nodes.forEach(function (node) {
    console.log(node.style());
    //console.log(nodes.json());
    console.log(JSON.stringify(node.json()))
    node_json += JSON.stringify(node.json());

    //Styleを足す部分(node.jsonだとスタイル出ないため)
    node_json = node_json.slice(0, -1); //最後の},を一旦消す
    node_json += `, "style": {`;
    node_json += `"background-color": "${ColorToHex(node.style('background-color'))}", `
    node_json += `"color": "${ColorToHex(node.style('color'))}", `
    node_json += `"shape": "${node.style('shape')}"},`//最後の「}」忘れずに

    node_json += "},\n";
  });

  let edges = cy.edges();

  edges.forEach(function (edge) {
    edge_json += JSON.stringify(edge.json());

    //Styleを足す部分(node.jsonだとスタイル出ないため)
    edge_json = edge_json.slice(0, -1); //最後の},を一旦消す
    edge_json += `, "style": {`;
    edge_json += `"color": "${ColorToHex(edge.style('color'))}", `;
    edge_json += `"line-color": "${ColorToHex(edge.style('line-color'))}", `;
    edge_json += `"target-arrow-color": "${ColorToHex(edge.style('target-arrow-color'))}", `;
    edge_json += `"target-arrow-shape": "${edge.style('target-arrow-shape')}", `
    edge_json += `"source-arrow-color": "${ColorToHex(edge.style('source-arrow-color'))}", `;
    edge_json += `"source-arrow-shape": "${edge.style('source-arrow-shape')}"},`;//最後の「}」忘れずに

    edge_json += "},\n";
  });

  //edge_json = edge_json.replaceAll(/"position":.*?},/g, "")

  s += node_json + edge_json;
  s += "]\n";


  //console.log(s.match(/\d+\.\d*/g));


  // const rep_num_list = s.match(/-?\d+\.\d*/g);//マイナスはあってもなくても良い、小数点含む数字と普通の数字
  // const rep_num_list_set = Array.from(new Set(rep_num_list))


  // rep_num_list_set.forEach(function (rep_num) {
  //   s = s.replaceAll(rep_num, `"${rep_num}"`);
  // });

  // s = s.replaceAll(/true/g, `"true"`).replace(/false/g, `"false"`)

  // const non_basic = /"removed":.*?,|"selected":.*?,|"selectable":.*?,|"locked":.*?,|"grabbable":.*?,|"pannable":.*?,|"classes":.*?""/ig
  // s = s.replaceAll(non_basic, '')

  return s;
};

const graphJsonSave_ALL = function () {

  //「.」は任意の1文字(改行以外)、「*?」は直前の繰り返し(最短)のもの、「|」で区切る
  const non_basic = /"removed":.*?,|"selected":.*?,|"selectable":.*?,|"locked":.*?,|"grabbable":.*?,|"pannable":.*?,/ig

  let s = graphJsonSave();
  console.log(s);
  s = s.replaceAll(non_basic, '');
  $("#SaveJsonData").val(s);
}

const graphJsonSave_P = function () {

  //「.」は任意の1文字(改行以外)、「*?」は直前の繰り返し(最短)のもの、「|」で区切る
  const non_basic = /"removed":.*?,|"selected":.*?,|"selectable":.*?,|"locked":.*?,|"grabbable":.*?,|"pannable":.*?,/ig

  let s = graphJsonSave();
  s = s.replaceAll(non_basic, '').replaceAll(/,\n*]/g, "\n]");;

  $("#SaveJsonData").val(s);

};

const graphJsonCopy = function (target_string) {
  console.log(target_string);

  let Json = $(`#${target_string}`).val();
  navigator.clipboard.writeText(Json);
}

const graphJsonFileSave = function () {
  const blob = new Blob([$("#SaveJsonData").val()], { type: "text/plain" });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = 'ファイル名.txt';
  link.click();
}


const chamgeElemJson_handle = function () {
  if (nowSelectedElemData.selected() === true) {

    //unselectで色反転が終了してから、
    // one(一回限り)にしないとtargetの選択が外される度に発動するので注意
    //https://js.cytoscape.org/#cy.one
    nowSelectedElemData.one('unselect', function () {

      //targetのスタイルのどれかの値が変更されたら(超重要なイベントです)
      //https://js.cytoscape.org/#events/collection-events
      //＝色反転が終了したら
      nowSelectedElemData.one('style', function () {
        //プロパティを変更する
        changeElemJson();



      });

    });
  } else {

    //普通の場合は普通にそのまま処理すればいい
    changeElemJson();

  }
}



//インスペクタ上から要素を編集する
const changeElemJson = function () {

  //共通の情報

  nowSelectedElemData.group(`${now_elem_group.value}`);
  nowSelectedElemData.data('id', `${now_elem_id.value}`);
  nowSelectedElemData.data('label', `${now_changelabel.value}`);
  nowSelectedElemData.position('x', parseFloat(now_pos_x.value));//座標は数字のまま
  nowSelectedElemData.position('y', parseFloat(now_pos_y.value));//座標は数字のまま
  nowSelectedElemData.style('color', `${now_labelcolor.value}`);

  //ColorToHex(nowSelectedElemData.style('color', now_labelcolor_str.value));

  if (now_elem_group.value === "nodes") {
    //ノードだけの情報


    //※ノードの場合、parentだけはこの方法で変更する(公式ドキュメント参照)
    //親無しにしたい場合は値を「null」に指定する
    //存在しないidを指定すると、自動的に弾かれて元のままになるようだった
    //https://js.cytoscape.org/#eles.move


    if (now_parent.value === "") {
      //空白の場合＝親削除する場合は、parentをnullにする
      nowSelectedElemData = nowSelectedElemData.move({
        parent: null
      });
    } else {
      //空白ではない場合は、parentの値を変更する
      nowSelectedElemData = nowSelectedElemData.move({
        parent: `${now_parent.value}`
      });
    }

    console.log(`${now_backgroundcolor.value}`)
    nowSelectedElemData.style('background-color', `${now_backgroundcolor.value}`);
    console.log(nowSelectedElemData.style('background-color') + "WTF")
    //ColorToHex(nowSelectedElemData.style('background-color', now_backgroundcolor_str.value));
    nowSelectedElemData.style('shape', `${now_shape.value}`);



  } else if (now_elem_group.value === "edges") {
    //エッジだけの情報

    //※エッジの場合、sourceとtargetだけはこの方法で変更する(公式ドキュメント参照)
    //存在しないidを指定すると、自動的に弾かれて元のままになるようだった
    //https://js.cytoscape.org/#eles.move
    nowSelectedElemData = nowSelectedElemData.move({
      source: `${now_source.value}`,
      target: `${now_target.value}`
    });

    nowSelectedElemData.data('source', `${now_source.value}`);
    nowSelectedElemData.data('target', `${now_target.value}`);


    nowSelectedElemData.style('line-color', `${now_linecolor.value}`);
    //ColorToHex(nowSelectedElemData.style('line-color', now_linecolor_str.value));
    nowSelectedElemData.style('target-arrow-color', `${now_t_arr_color.value}`);
    //ColorToHex(nowSelectedElemData.style('target-arrow-color', now_t_arr_color_str.value));
    nowSelectedElemData.style('target-arrow-shape', `${now_t_arr_shape.value}`);
    nowSelectedElemData.style('source-arrow-color', `${now_s_arr_color.value}`);
    //ColorToHex(nowSelectedElemData.style('source-arrow-color', now_s_arr_color_str.value));
    nowSelectedElemData.style('source-arrow-shape', `${now_s_arr_shape.value}`);
  } else {
    console.log("error");
  }
}


const reset_qmenu_generate_conf = function () {
  qmenu_elem_parent.value = "";
  qmenu_elem_source.value = "";
  qmenu_elem_target.value = "";
}

//ページを更新する直前の処理
window.addEventListener('beforeunload', function () {


  //現在表示されているグラフのJSONを更新後の画面に持っていくために
  //hiddenのinputに値を保存しておく
  //これの時点では余計な改行は入らないので、置き換えに正規表現は使わない
  HiddenNowJsonData.value = graphJsonSave().replaceAll(",}", "}").replaceAll(",\n]", "\n]");
  //ズーム倍率とパンの座標も同じhiddenに保存する

  cy_zoom.value = cy.zoom();//文字列なので後でIntに変換
  cy_pan_x.value = cy.pan('x');//文字列なので後でfloatに変換
  cy_pan_y.value = cy.pan('y');//文字列なので後でfloatに変換
  /*
  now_json = graphJsonSave();
  console.log("testetetetetete")
  console.log(now_json)
  console.log(now_json.replace(/\r?\n/g, ''))
  cy.add(JSON.parse(now_json.replace(/\r?\n/g, '')));*/
});

//ページを更新した後にやる処理
window.addEventListener('load', function () {
  //let elements = cy.elements();
  //console.log(HiddenNowJsonData.value + "unchi");
  //console.log(JSON.parse(HiddenNowJsonData.value.replace(",}", "}").replace(",]", "]")))
  //cy.add(JSON.parse(HiddenNowJsonData.value.replace("[", "").replace("]", "")));
  //console.log(HiddenNowJsonData.value);
  //console.log(JSON.parse(HiddenNowJsonData.value))


  ///確認のためにコンソールログにJSONの結果出す
  console.log(HiddenNowJsonData.value)
  //console.log(eval($("#LoadJsonData").val()))
  //console.log(JSON.parse($("#LoadJsonData").val()))
  //JSON.parse(HiddenNowJsonData.value)

  //JSON.parseでエラー出たらコンソール確認する
  cy.add(JSON.parse(HiddenNowJsonData.value));
  //cy.remove(elements);
  //cy.add(eval($("#LoadJsonData").val()));
  //changeLayout();

  //
  cy.zoom(parseFloat(cy_zoom.value));//文字列なのでfloatに変換
  cy.pan({
    x: parseFloat(cy_pan_x.value),//文字列なのでfloatに変換
    y: parseFloat(cy_pan_y.value)//文字列なのでfloatに変換
  });
  //console.log(cy_zoom.value);
  //console.log(cy_pan_x.value);
  //console.log(cy_pan_y.value);
});


//Ctrl+ZとCtrl＋Yの処理(処理を戻ると進む)
document.addEventListener('keydown', function (e) {
  if (e.ctrlKey && e.key == 'z') {
    cy.undoRedo().undo();
  }
  else if (e.ctrlKey && e.key == 'y') {
    cy.undoRedo().redo();
  }
}, true);








