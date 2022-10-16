"use strict";

//読み込み早すぎてhtml関係の処理でエラー出るの回避するために
//DOMコンテンツがロードされた後に色々やる
document.addEventListener("DOMContentLoaded", function () {

  if (node_parent_check.checked === true) {
    node_parent.disabled = true;
  } else {
    node_parent.disabled = false;
  }


  node_parent_check.addEventListener('change', function () {

    if (node_parent_check.checked === true) {
      node_parent.disabled = true;
    } else {
      node_parent.disabled = false;
    }
  });

});

const GenerateNodeJson = function () {

  let result;

  if (node_parent_check.checked === true) {
    result = `{"data":{"id":"${node_id.value}","label":"${node_label.value}"},"position":{"x":${node_x.value},"y":${node_y.value}},
    "style":{"background-color":"${node_backcolor.value}","color":"${node_labelcolor.value}","shape":"${node_shape.value}"},"group":"nodes",},\n`

  } else {
    result = `{"data":{"id":"${node_id.value}","parent":"${node_parent.value}","label":"${node_label.value}"},"position":{"x":${node_x.value},"y":${node_y.value}},
    "style":{"background-color":"${node_backcolor.value}","color":"${node_labelcolor.value}","shape":"${node_shape.value}"},"group":"nodes",},\n`
  }

  node_json.value += result;

}

const GenerateEdgeJson = function () {
  const result = `{"data":{"id":"${edge_id.value}","source":"${edge_source.value}","target":"${edge_target.value}","label":"${edge_label.value}"},
  "style":{"color":"${edge_labelcolor.value}","line-color":"${edge_linecolor.value}","target-arrow-color":"${edge_t_arrow_color.value}","target-arrow-shape":"${edge_t_arrow_shape.value}",
  "source-arrow-color":"${edge_s_arrow_color.value}","source-arrow-shape":"${edge_s_arrow_shape.value}"},"group":"edges",},\n`;

  edge_json.value += result;
}

const graphJsonCopy = function (target_string) {
  console.log(target_string);

  let Json = window[target_string].value;
  navigator.clipboard.writeText(Json);
}

const graphJsonFileSave = function (target_id, target_filename) {
  const blob = new Blob([window[target_id].value], { type: "text/plain" });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = `${window[target_filename].value}.txt`;
  link.click();
}